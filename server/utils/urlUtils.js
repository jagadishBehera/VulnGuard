/**
 * utils/urlUtils.js — URL parsing, validation, and normalization helpers
 */

'use strict';

/**
 * Validates whether a string is a well-formed absolute HTTP/HTTPS URL.
 * @param {string} url
 * @returns {boolean}
 */
function isValidUrl(url) {
  try {
    const parsed = new URL(url);
    return ['http:', 'https:'].includes(parsed.protocol);
  } catch {
    return false;
  }
}

/**
 * Resolves a potentially relative URL against a base URL.
 * Returns null if the resulting URL is invalid or uses a non-HTTP protocol.
 * @param {string} href
 * @param {string} base
 * @returns {string|null}
 */
function resolveUrl(href, base) {
  if (!href || typeof href !== 'string') return null;

  // Skip non-navigable hrefs
  if (
    href.startsWith('#') ||
    href.startsWith('javascript:') ||
    href.startsWith('mailto:') ||
    href.startsWith('tel:')
  ) {
    return null;
  }

  try {
    const resolved = new URL(href, base);
    if (!['http:', 'https:'].includes(resolved.protocol)) return null;
    // Strip fragment — we care about unique pages, not anchors
    resolved.hash = '';
    return resolved.toString();
  } catch {
    return null;
  }
}

/**
 * Checks if a URL belongs to the same origin as the base URL.
 * Used to limit the crawler to the target domain.
 * @param {string} url
 * @param {string} base
 * @returns {boolean}
 */
function isSameOrigin(url, base) {
  try {
    return new URL(url).origin === new URL(base).origin;
  } catch {
    return false;
  }
}

/**
 * Injects a payload into every query parameter of a URL.
 * e.g. /search?q=foo&page=1 → /search?q=PAYLOAD&page=PAYLOAD
 * @param {string} url
 * @param {string} payload
 * @returns {string[]} Array of mutated URLs (one per param)
 */
function injectPayloadIntoQueryParams(url, payload) {
  try {
    const parsed = new URL(url);
    const results = [];

    parsed.searchParams.forEach((_value, key) => {
      const mutated = new URL(url);
      mutated.searchParams.set(key, payload);
      results.push(mutated.toString());
    });

    return results;
  } catch {
    return [];
  }
}

/**
 * Extracts the base origin + pathname without query/hash.
 * @param {string} url
 * @returns {string}
 */
function stripQueryAndHash(url) {
  try {
    const parsed = new URL(url);
    parsed.search = '';
    parsed.hash = '';
    return parsed.toString();
  } catch {
    return url;
  }
}

module.exports = {
  isValidUrl,
  resolveUrl,
  isSameOrigin,
  injectPayloadIntoQueryParams,
  stripQueryAndHash,
};