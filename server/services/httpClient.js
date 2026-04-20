/**
 * services/httpClient.js — Axios-based HTTP client
 *
 * Features:
 * - Configurable timeout
 * - Consistent browser-like headers to avoid bot-detection
 * - Safe error normalization (never throws on network errors)
 */

'use strict';

const axios = require('axios');
const { logger } = require('../utils/logger');

const DEFAULT_TIMEOUT = parseInt(process.env.REQUEST_TIMEOUT_MS, 10) || 10000;

// Reuse a single Axios instance for connection pooling
const httpClient = axios.create({
  timeout: DEFAULT_TIMEOUT,
  maxRedirects: 5,
  validateStatus: () => true, // Never throw on 4xx/5xx — we inspect status ourselves
  headers: {
    'User-Agent':
      'Mozilla/5.0 (compatible; VulnScanner/1.0; +https://github.com/vuln-scanner)',
    Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
    'Accept-Language': 'en-US,en;q=0.5',
    'Accept-Encoding': 'gzip, deflate',
    Connection: 'keep-alive',
  },
});

/**
 * Performs a GET request and returns a normalized result object.
 * Never throws — errors are captured and returned in the result.
 *
 * @param {string} url
 * @param {object} [options]
 * @param {number} [options.timeout]
 * @returns {Promise<{ ok: boolean, status: number|null, data: string, headers: object, error: string|null }>}
 */
async function get(url, options = {}) {
  try {
    const response = await httpClient.get(url, {
      timeout: options.timeout || DEFAULT_TIMEOUT,
      responseType: 'text',
    });

    return {
      ok: true,
      status: response.status,
      data: typeof response.data === 'string' ? response.data : JSON.stringify(response.data),
      headers: response.headers || {},
      error: null,
    };
  } catch (err) {
    const reason = err.code === 'ECONNABORTED' ? 'Request timed out' : err.message;
    logger.debug(`GET failed: ${url}`, { error: reason });

    return { ok: false, status: null, data: '', headers: {}, error: reason };
  }
}

/**
 * Performs a POST request (form submission) and returns a normalized result.
 * Never throws.
 *
 * @param {string} url
 * @param {object} formData — key/value pairs submitted as application/x-www-form-urlencoded
 * @param {object} [options]
 * @returns {Promise<{ ok: boolean, status: number|null, data: string, headers: object, error: string|null }>}
 */
async function post(url, formData, options = {}) {
  try {
    const params = new URLSearchParams(formData);
    const response = await httpClient.post(url, params.toString(), {
      timeout: options.timeout || DEFAULT_TIMEOUT,
      responseType: 'text',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    });

    return {
      ok: true,
      status: response.status,
      data: typeof response.data === 'string' ? response.data : JSON.stringify(response.data),
      headers: response.headers || {},
      error: null,
    };
  } catch (err) {
    const reason = err.code === 'ECONNABORTED' ? 'Request timed out' : err.message;
    logger.debug(`POST failed: ${url}`, { error: reason });

    return { ok: false, status: null, data: '', headers: {}, error: reason };
  }
}

/**
 * Attempts a slow/timing request to detect blind SQL injection.
 * Returns the actual elapsed time in milliseconds regardless of success/failure.
 *
 * @param {string} url
 * @param {number} [timeoutMs=15000]
 * @returns {Promise<{ elapsedMs: number, timedOut: boolean, error: string|null }>}
 */
async function timedGet(url, timeoutMs = 15000) {
  const start = Date.now();
  try {
    await httpClient.get(url, { timeout: timeoutMs, responseType: 'text' });
    return { elapsedMs: Date.now() - start, timedOut: false, error: null };
  } catch (err) {
    const elapsed = Date.now() - start;
    const timedOut = err.code === 'ECONNABORTED';
    return { elapsedMs: elapsed, timedOut, error: err.message };
  }
}

module.exports = { get, post, timedGet };