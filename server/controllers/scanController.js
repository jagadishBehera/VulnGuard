/**
 * controllers/scanController.js — Handles POST /scan requests
 *
 * Responsibilities:
 * 1. Validate and sanitize the incoming target URL
 * 2. Invoke the scan engine
 * 3. Persist results to MongoDB (non-blocking — doesn't fail the response)
 * 4. Return structured JSON response
 */

'use strict';

const { runScan } = require('../services/scanEngine');
const { isValidUrl } = require('../utils/urlUtils');
const { logger } = require('../utils/logger');
const ScanResult = require('../models/ScanResult');

/**
 * POST /api/scan
 *
 * Body: { "url": "https://example.com" }
 *
 * Response: {
 *   success: true,
 *   vulnerabilities: [...],
 *   scannedUrls: [...],
 *   riskLevel: "low | medium | high",
 *   durationMs: 1234,
 *   scanId: "..."
 * }
 */
async function startScan(req, res) {
  // ── Input Validation ───────────────────────────────────────────────────────
  const { url } = req.body;

  if (!url || typeof url !== 'string') {
    return res.status(400).json({
      success: false,
      error: 'Request body must include a "url" string field',
    });
  }

  const trimmedUrl = url.trim();

  if (!isValidUrl(trimmedUrl)) {
    return res.status(400).json({
      success: false,
      error: 'Invalid URL. Must be a full absolute HTTP or HTTPS URL (e.g. https://example.com)',
    });
  }

  // Block scanning of private/loopback addresses (basic SSRF protection)
  if (isPrivateAddress(trimmedUrl)) {
    return res.status(400).json({
      success: false,
      error: 'Scanning private/loopback addresses is not permitted',
    });
  }

  logger.info(`Scan request received`, { targetUrl: trimmedUrl, ip: req.ip });

  // Create a pending DB record before scan starts (for tracking long-running scans)
  let scanRecord = null;
  try {
    scanRecord = await ScanResult.create({
      targetUrl: trimmedUrl,
      status: 'running',
    });
  } catch (dbErr) {
    // MongoDB unavailable — continue without persistence
    logger.warn('Could not create DB scan record', { error: dbErr.message });
  }

  // ── Run Scan ───────────────────────────────────────────────────────────────
  let scanResult;
  try {
    scanResult = await runScan(trimmedUrl);
  } catch (err) {
    logger.error('Scan failed', { targetUrl: trimmedUrl, error: err.message });

    // Update DB record as failed
    if (scanRecord) {
      await ScanResult.findByIdAndUpdate(scanRecord._id, {
        status: 'failed',
        error: err.message,
      }).catch(() => {});
    }

    return res.status(502).json({
      success: false,
      error: err.message || 'Scan failed — target may be unreachable',
    });
  }

  const { vulnerabilities, scannedUrls, riskLevel, durationMs } = scanResult;

  // ── Persist Results ────────────────────────────────────────────────────────
  let scanId = null;
  if (scanRecord) {
    try {
      const updated = await ScanResult.findByIdAndUpdate(
        scanRecord._id,
        {
          scannedUrls,
          vulnerabilities,
          riskLevel,
          status: 'completed',
          durationMs,
        },
        { new: true }
      );
      scanId = updated?._id?.toString() || null;
    } catch (dbErr) {
      logger.warn('Could not persist scan results to DB', { error: dbErr.message });
    }
  }

  // ── Respond ────────────────────────────────────────────────────────────────
  return res.status(200).json({
    success: true,
    scanId,
    targetUrl: trimmedUrl,
    vulnerabilities,
    scannedUrls,
    riskLevel,
    summary: {
      totalUrls: scannedUrls.length,
      totalVulnerabilities: vulnerabilities.length,
      xssCount: vulnerabilities.filter((v) => v.type === 'xss').length,
      sqliCount: vulnerabilities.filter((v) => ['sqli', 'sqli_timing'].includes(v.type)).length,
      durationMs,
    },
  });
}

/**
 * GET /api/scans/:id
 * Retrieves a previously stored scan result from MongoDB.
 */
async function getScanResult(req, res) {
  const { id } = req.params;

  try {
    const record = await ScanResult.findById(id).lean();
    if (!record) {
      return res.status(404).json({ success: false, error: 'Scan not found' });
    }
    return res.status(200).json({ success: true, scan: record });
  } catch (err) {
    return res.status(500).json({ success: false, error: 'Failed to retrieve scan result' });
  }
}

/**
 * GET /api/scans
 * Returns recent scans (last 20).
 */
async function listScans(req, res) {
  try {
    const scans = await ScanResult.find({})
      .sort({ createdAt: -1 })
      .limit(20)
      .select('targetUrl riskLevel status durationMs createdAt summary')
      .lean();

    return res.status(200).json({ success: true, scans });
  } catch (err) {
    return res.status(500).json({ success: false, error: 'Failed to retrieve scan list' });
  }
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Rudimentary SSRF protection: blocks scanning of private/loopback IPs and hostnames.
 * @param {string} url
 * @returns {boolean}
 */
function isPrivateAddress(url) {
  try {
    const { hostname } = new URL(url);
    return (
      hostname === 'localhost' ||
      hostname === '127.0.0.1' ||
      hostname === '::1' ||
      hostname.startsWith('192.168.') ||
      hostname.startsWith('10.') ||
      hostname.startsWith('172.16.') ||
      hostname === '0.0.0.0'
    );
  } catch {
    return false;
  }
}

module.exports = { startScan, getScanResult, listScans };