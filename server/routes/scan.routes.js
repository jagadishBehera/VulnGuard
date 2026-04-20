/**
 * routes/scan.routes.js — API route definitions
 *
 * Routes:
 *   POST   /api/scan          — Start a new vulnerability scan
 *   GET    /api/scans         — List recent scan results
 *   GET    /api/scans/:id     — Get a specific scan result
 */

'use strict';

const express = require('express');
const router = express.Router();
const { startScan, getScanResult, listScans } = require('../controllers/scanController');
const protect = require('../middleware/authMiddleware');

// ── Rate limiting middleware (basic in-memory) ────────────────────────────────
const scanTimestamps = new Map();
const RATE_LIMIT_WINDOW_MS = 60 * 1000; // 1 minute
const RATE_LIMIT_MAX_SCANS = 5;          // Max 5 scans per IP per minute

function rateLimiter(req, res, next) {
  const ip = req.ip;
  const now = Date.now();

  if (!scanTimestamps.has(ip)) {
    scanTimestamps.set(ip, []);
  }

  // Purge old timestamps outside the window
  const timestamps = scanTimestamps.get(ip).filter((t) => now - t < RATE_LIMIT_WINDOW_MS);
  scanTimestamps.set(ip, timestamps);

  if (timestamps.length >= RATE_LIMIT_MAX_SCANS) {
    return res.status(429).json({
      success: false,
      error: `Rate limit exceeded. Max ${RATE_LIMIT_MAX_SCANS} scans per minute.`,
      retryAfter: Math.ceil((timestamps[0] + RATE_LIMIT_WINDOW_MS - now) / 1000),
    });
  }

  timestamps.push(now);
  next();
}

// ── Routes ────────────────────────────────────────────────────────────────────

/**
 * POST /api/scan
 * Body: { "url": "https://target.com" }
 */
router.post('/scan', rateLimiter, startScan);

/**
 * GET /api/scans
 * Returns the 20 most recent scans.
 */
router.get('/scans', protect, listScans);

/**
 * GET /api/scans/:id
 * Returns a specific scan result by MongoDB ObjectId.
 */
router.get('/scans/:id', protect, getScanResult);

module.exports = router;