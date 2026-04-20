/**
 * services/scanEngine.js — Core scan orchestrator
 *
 * Responsibilities:
 * 1. Accept a target URL
 * 2. Crawl the target to discover URLs and forms
 * 3. Run XSS and SQLi checks on all discovered surface with concurrency control
 * 4. Aggregate and deduplicate findings
 * 5. Return a structured result object
 */

'use strict';

const pLimit = require('p-limit');
const { crawl } = require('./crawler');
const { scanUrlForXSS, scanFormForXSS } = require('./xssScanner');
const { scanUrlForSQLi, scanUrlForBlindSQLi, scanFormForSQLi } = require('./sqliScanner');
const { calculateRiskLevel } = require('../utils/riskCalculator');
const { logger } = require('../utils/logger');

const MAX_CONCURRENT = parseInt(process.env.MAX_CONCURRENT_REQUESTS, 10) || 5;

/**
 * Runs a full vulnerability scan against a target URL.
 *
 * @param {string} targetUrl — The URL submitted by the user
 * @returns {Promise<{
 *   vulnerabilities: Array,
 *   scannedUrls: string[],
 *   riskLevel: string,
 *   durationMs: number
 * }>}
 */
async function runScan(targetUrl) {
  const startTime = Date.now();
  logger.info(`Scan started`, { targetUrl });

  // ── Phase 1: Crawl ─────────────────────────────────────────────────────────
  logger.info('Phase 1: Crawling target...');
  let crawlResult;
  try {
    crawlResult = await crawl(targetUrl);
  } catch (err) {
    logger.error('Crawl phase failed', { error: err.message });
    throw new Error(`Target unreachable or crawl failed: ${err.message}`);
  }

  const { urls, forms } = crawlResult;
  logger.info(`Crawl complete`, { urlCount: urls.length, formCount: forms.length });

  // ── Phase 2: Vulnerability Scanning ───────────────────────────────────────
  logger.info('Phase 2: Scanning for vulnerabilities...');

  // Concurrency limiter — prevents hammering the target server
  const limit = pLimit(MAX_CONCURRENT);
  const allFindings = [];

  // Build task list for all URLs
  const urlTasks = urls.flatMap((url) => {
    // Only scan URLs that have query parameters (nothing to inject otherwise)
    let hasParams = false;
    try {
      hasParams = new URL(url).searchParams.size > 0;
    } catch { /* ignore */ }

    if (!hasParams) return [];

    return [
      // XSS check
      limit(async () => {
        logger.debug(`XSS scan: ${url}`);
        const findings = await scanUrlForXSS(url);
        if (findings.length > 0) {
          logger.warn(`XSS vulnerabilities found at ${url}`, { count: findings.length });
          allFindings.push(...findings);
        }
      }),

      // SQL injection check (error + boolean)
      limit(async () => {
        logger.debug(`SQLi scan: ${url}`);
        const findings = await scanUrlForSQLi(url);
        if (findings.length > 0) {
          logger.warn(`SQLi vulnerabilities found at ${url}`, { count: findings.length });
          allFindings.push(...findings);
        }
      }),

      // Time-based blind SQLi check (only for URLs with params)
      limit(async () => {
        logger.debug(`Blind SQLi timing scan: ${url}`);
        const findings = await scanUrlForBlindSQLi(url);
        if (findings.length > 0) {
          logger.warn(`Blind SQLi found at ${url}`, { count: findings.length });
          allFindings.push(...findings);
        }
      }),
    ];
  });

  // Build task list for all forms
  const formTasks = forms.flatMap((form) => [
    // XSS in forms
    limit(async () => {
      logger.debug(`XSS form scan: ${form.action}`);
      const findings = await scanFormForXSS(form);
      if (findings.length > 0) {
        allFindings.push(...findings);
      }
    }),

    // SQLi in forms
    limit(async () => {
      logger.debug(`SQLi form scan: ${form.action}`);
      const findings = await scanFormForSQLi(form);
      if (findings.length > 0) {
        allFindings.push(...findings);
      }
    }),
  ]);

  // Execute all tasks in parallel (bounded by concurrency limit)
  const allTasks = [...urlTasks, ...formTasks];
  logger.info(`Executing ${allTasks.length} scan tasks (concurrency: ${MAX_CONCURRENT})`);

  await Promise.allSettled(allTasks);

  // ── Phase 3: Aggregate Results ─────────────────────────────────────────────
  const dedupedFindings = deduplicateFindings(allFindings);
  const riskLevel = calculateRiskLevel(dedupedFindings);
  const durationMs = Date.now() - startTime;

  logger.info(`Scan complete`, {
    totalFindings: dedupedFindings.length,
    riskLevel,
    durationMs,
  });

  return {
    vulnerabilities: dedupedFindings,
    scannedUrls: urls,
    riskLevel,
    durationMs,
  };
}

/**
 * Deduplicates findings by (type, url, parameter) to avoid reporting
 * the same vulnerability multiple times from different payloads.
 *
 * @param {Array} findings
 * @returns {Array}
 */
function deduplicateFindings(findings) {
  const seen = new Set();
  return findings.filter((f) => {
    const key = `${f.type}|${f.url}|${f.parameter}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

module.exports = { runScan };