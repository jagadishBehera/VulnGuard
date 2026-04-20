/**
 * services/crawler.js — Web crawler module
 *
 * Strategy:
 * 1. Fetch page HTML via Axios (fast, for static pages)
 * 2. Fall back to Puppeteer (for JS-rendered dynamic pages)
 * 3. Extract all <a href> links
 * 4. Extract all <form> elements with their fields and action URLs
 * 5. Stay within the same origin (no external crawling)
 * 6. Respect crawl depth and URL limit from config
 */

'use strict';

const cheerio = require('cheerio');
const { logger } = require('../utils/logger');
const { get } = require('./httpClient');
const { resolveUrl, isSameOrigin, stripQueryAndHash } = require('../utils/urlUtils');

const MAX_URLS = parseInt(process.env.MAX_URLS_PER_SCAN, 10) || 50;
const CRAWL_DEPTH = parseInt(process.env.CRAWL_DEPTH, 10) || 2;

/**
 * Represents a discovered HTML form with its fields.
 * @typedef {Object} CrawledForm
 * @property {string} pageUrl  — Page the form was found on
 * @property {string} action   — Form submission URL
 * @property {string} method   — 'get' | 'post'
 * @property {Array<{ name: string, type: string, value: string }>} fields
 */

/**
 * Fetches a page's HTML.
 * Tries Axios first; falls back to Puppeteer if the response appears to be a
 * blank JS-rendered page (body under 500 chars or contains 'noscript' redirect).
 *
 * @param {string} url
 * @returns {Promise<string>} Raw HTML string
 */
async function fetchPage(url) {
  const result = await get(url);
  if (!result.ok) {
    logger.warn(`Static fetch failed for ${url}: ${result.error}`);
    return await fetchWithPuppeteer(url);
  }

  // Heuristic: if we got very little HTML, it's likely JS-rendered
  const html = result.data || '';
  const isLikelyDynamic =
    html.length < 500 || /<noscript>/i.test(html) || !/<body/i.test(html);

  if (isLikelyDynamic) {
    logger.debug(`Falling back to Puppeteer for ${url}`);
    const dynamicHtml = await fetchWithPuppeteer(url);
    return dynamicHtml || html; // If Puppeteer also fails, use what we have
  }

  return html;
}

/**
 * Uses Puppeteer to fully render a page (executes JavaScript).
 * @param {string} url
 * @returns {Promise<string>}
 */
async function fetchWithPuppeteer(url) {
  let browser;
  try {
    const puppeteer = require('puppeteer');
    browser = await puppeteer.launch({
      headless: 'new',
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage', // Prevents crashes in Docker/CI
        '--disable-gpu',
      ],
    });

    const page = await browser.newPage();

    // Block images/fonts/media to speed up scanning
    await page.setRequestInterception(true);
    page.on('request', (req) => {
      const blocked = ['image', 'stylesheet', 'font', 'media'];
      if (blocked.includes(req.resourceType())) {
        req.abort();
      } else {
        req.continue();
      }
    });

    await page.setUserAgent(
      'Mozilla/5.0 (compatible; VulnScanner/1.0)'
    );

    await page.goto(url, {
      waitUntil: 'networkidle2',
      timeout: parseInt(process.env.REQUEST_TIMEOUT_MS, 10) || 10000,
    });

    const html = await page.content();
    logger.debug(`Puppeteer fetched ${html.length} bytes from ${url}`);
    return html;
  } catch (err) {
    logger.error(`Puppeteer failed for ${url}`, { error: err.message });
    return '';
  } finally {
    if (browser) await browser.close();
  }
}

/**
 * Parses all <a href> links from HTML and resolves them against a base URL.
 * Only returns same-origin links.
 *
 * @param {string} html
 * @param {string} baseUrl
 * @returns {string[]} Deduplicated list of absolute same-origin URLs
 */
function extractLinks(html, baseUrl) {
  const $ = cheerio.load(html);
  const links = new Set();

  $('a[href]').each((_i, el) => {
    const href = $(el).attr('href');
    const resolved = resolveUrl(href, baseUrl);
    if (resolved && isSameOrigin(resolved, baseUrl)) {
      links.add(stripQueryAndHash(resolved));
    }
  });

  return [...links];
}

/**
 * Parses all <form> elements from HTML and extracts:
 * - action URL (resolved to absolute)
 * - method (get/post)
 * - all input/textarea/select field names and types
 *
 * @param {string} html
 * @param {string} pageUrl — Page the form was found on (used to resolve relative actions)
 * @returns {CrawledForm[]}
 */
function extractForms(html, pageUrl) {
  const $ = cheerio.load(html);
  const forms = [];

  $('form').each((_i, formEl) => {
    const rawAction = $(formEl).attr('action') || '';
    const method = ($(formEl).attr('method') || 'get').toLowerCase();

    // Resolve form action to absolute URL
    const action = resolveUrl(rawAction || pageUrl, pageUrl) || pageUrl;

    // Gather all submittable fields
    const fields = [];
    $(formEl)
      .find('input, textarea, select')
      .each((_j, fieldEl) => {
        const name = $(fieldEl).attr('name');
        const type = $(fieldEl).attr('type') || fieldEl.name; // input | textarea | select
        const value = $(fieldEl).attr('value') || '';

        if (name) {
          fields.push({ name, type, value });
        }
      });

    // Only record forms that have at least one named field
    if (fields.length > 0) {
      forms.push({ pageUrl, action, method, fields });
    }
  });

  return forms;
}

/**
 * Main crawler function.
 * Performs a breadth-first crawl starting from `startUrl`, respecting
 * same-origin policy and configured depth/URL limits.
 *
 * @param {string} startUrl
 * @returns {Promise<{ urls: string[], forms: CrawledForm[] }>}
 */
async function crawl(startUrl) {
  const visitedUrls = new Set();
  const allForms = [];
  const queue = [{ url: startUrl, depth: 0 }];

  logger.info(`Starting crawl from ${startUrl}`, { maxDepth: CRAWL_DEPTH, maxUrls: MAX_URLS });

  while (queue.length > 0 && visitedUrls.size < MAX_URLS) {
    const { url, depth } = queue.shift();
    const normalizedUrl = stripQueryAndHash(url);

    // Skip already-visited pages
    if (visitedUrls.has(normalizedUrl)) continue;
    visitedUrls.add(normalizedUrl);

    logger.debug(`Crawling [depth=${depth}]: ${normalizedUrl}`);

    try {
      const html = await fetchPage(normalizedUrl);
      if (!html) continue;

      // Extract forms from this page
      const pageForms = extractForms(html, normalizedUrl);
      allForms.push(...pageForms);
      logger.debug(`Found ${pageForms.length} forms on ${normalizedUrl}`);

      // Only follow links if we haven't hit max depth
      if (depth < CRAWL_DEPTH) {
        const links = extractLinks(html, startUrl); // pass startUrl as origin anchor
        for (const link of links) {
          if (!visitedUrls.has(link) && visitedUrls.size + queue.length < MAX_URLS) {
            queue.push({ url: link, depth: depth + 1 });
          }
        }
      }
    } catch (err) {
      logger.error(`Crawl error at ${normalizedUrl}`, { error: err.message });
    }
  }

  const urls = [...visitedUrls];
  logger.info(`Crawl complete`, { urlsVisited: urls.length, formsFound: allForms.length });

  return { urls, forms: allForms };
}

module.exports = { crawl, fetchPage, extractLinks, extractForms };