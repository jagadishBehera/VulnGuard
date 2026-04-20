/**
 * services/xssScanner.js — XSS (Cross-Site Scripting) vulnerability detection
 *
 * Strategy:
 * - Inject multiple XSS payloads into URL query parameters and form fields
 * - Check if the payload is reflected (unescaped) in the response body
 * - A reflected payload means the application echoes user input into the HTML
 *   without encoding it — a clear XSS vulnerability
 */

'use strict';

const { get, post } = require('./httpClient');
const { injectPayloadIntoQueryParams } = require('../utils/urlUtils');
const { logger } = require('../utils/logger');

/**
 * XSS payloads ordered from simplest to most evasive.
 * We use multiple to bypass naive filters.
 */
const XSS_PAYLOADS = [
  `<script>alert('XSS')</script>`,
  `"><script>alert('XSS')</script>`,
  `'><script>alert('XSS')</script>`,
  `<img src=x onerror=alert('XSS')>`,
  `<svg onload=alert('XSS')>`,
  `javascript:alert('XSS')`,
];

/**
 * Checks whether an XSS payload is present (reflected) in the response body.
 * We look for the literal payload or key characteristic substrings.
 *
 * @param {string} responseBody
 * @param {string} payload
 * @returns {{ reflected: boolean, evidence: string|null }}
 */
function detectReflection(responseBody, payload) {
  if (!responseBody) return { reflected: false, evidence: null };

  const lower = responseBody.toLowerCase();
  const payloadLower = payload.toLowerCase();

  // Direct reflection check
  if (lower.includes(payloadLower)) {
    // Extract a snippet of context around the match for reporting
    const idx = lower.indexOf(payloadLower);
    const start = Math.max(0, idx - 40);
    const end = Math.min(responseBody.length, idx + payload.length + 40);
    const evidence = `...${responseBody.slice(start, end)}...`;
    return { reflected: true, evidence };
  }

  // Check for partial reflection of dangerous chars (weak encoding bypass indicator)
  const dangerousPatterns = ['<script', 'onerror=', 'onload=', 'javascript:'];
  for (const pattern of dangerousPatterns) {
    if (lower.includes(pattern)) {
      return {
        reflected: true,
        evidence: `Dangerous pattern "${pattern}" found in response`,
      };
    }
  }

  return { reflected: false, evidence: null };
}

/**
 * Tests a single URL for XSS by injecting payloads into query parameters.
 *
 * @param {string} url
 * @returns {Promise<Array>} Array of vulnerability findings
 */
async function scanUrlForXSS(url) {
  const findings = [];

  for (const payload of XSS_PAYLOADS) {
    const injectedUrls = injectPayloadIntoQueryParams(url, payload);

    for (const injectedUrl of injectedUrls) {
      try {
        const result = await get(injectedUrl);
        if (!result.ok) continue;

        const { reflected, evidence } = detectReflection(result.data, payload);
        if (reflected) {
          // Extract which param was injected from the URL diff
          const originalParams = new URL(url).searchParams;
          const injectedParams = new URL(injectedUrl).searchParams;
          let injectedParam = null;
          for (const [key, val] of injectedParams.entries()) {
            if (val === payload && originalParams.get(key) !== payload) {
              injectedParam = key;
              break;
            }
          }

          logger.warn(`XSS FOUND at ${url}`, { param: injectedParam, payload });

          findings.push({
            type: 'xss',
            severity: 'high',
            url: url,
            parameter: injectedParam,
            payload,
            description: `Reflected XSS: payload was echoed unescaped in the response body via query parameter "${injectedParam}"`,
            evidence,
          });

          // One confirmed finding per URL is sufficient; stop trying more payloads
          return findings;
        }
      } catch (err) {
        logger.debug(`XSS URL scan error: ${injectedUrl}`, { error: err.message });
      }
    }
  }

  return findings;
}

/**
 * Tests a form for XSS by submitting payloads in each field.
 *
 * @param {object} form — CrawledForm object from crawler
 * @returns {Promise<Array>} Array of vulnerability findings
 */
async function scanFormForXSS(form) {
  const findings = [];

  for (const payload of XSS_PAYLOADS) {
    // Build form data: inject payload into every text-like field
    const formData = {};
    for (const field of form.fields) {
      const injectable = ['text', 'search', 'email', 'url', 'textarea', 'password', ''].includes(
        field.type
      );
      formData[field.name] = injectable ? payload : field.value || 'test';
    }

    try {
      let result;
      if (form.method === 'post') {
        result = await post(form.action, formData);
      } else {
        const url = new URL(form.action);
        for (const [k, v] of Object.entries(formData)) {
          url.searchParams.set(k, v);
        }
        result = await get(url.toString());
      }

      if (!result.ok) continue;

      const { reflected, evidence } = detectReflection(result.data, payload);
      if (reflected) {
        // Identify which field carried the payload
        const injectedFields = form.fields
          .filter((f) => formData[f.name] === payload)
          .map((f) => f.name)
          .join(', ');

        logger.warn(`XSS FOUND in form at ${form.action}`, {
          fields: injectedFields,
          payload,
        });

        findings.push({
          type: 'xss',
          severity: 'high',
          url: form.action,
          parameter: injectedFields,
          payload,
          description: `Reflected XSS: payload submitted via form field(s) "${injectedFields}" was echoed unescaped`,
          evidence,
        });

        return findings; // One confirmed finding per form is sufficient
      }
    } catch (err) {
      logger.debug(`XSS form scan error: ${form.action}`, { error: err.message });
    }
  }

  return findings;
}

module.exports = { scanUrlForXSS, scanFormForXSS };