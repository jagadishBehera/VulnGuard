/**
 * models/ScanResult.js — Mongoose schema for persisting scan results.
 */

'use strict';

const mongoose = require('mongoose');

// ─── Sub-schemas ──────────────────────────────────────────────────────────────

const VulnerabilitySchema = new mongoose.Schema(
  {
    // Type of vulnerability: 'xss' | 'sqli' | 'sqli_timing' | 'error_info'
    type: {
      type: String,
      required: true,
      enum: ['xss', 'sqli', 'sqli_timing', 'error_info'],
    },

    // Severity classification
    severity: {
      type: String,
      required: true,
      enum: ['low', 'medium', 'high', 'critical'],
    },

    // The URL where the vulnerability was found
    url: { type: String, required: true },

    // The parameter or field that was injected
    parameter: { type: String, default: null },

    // The payload used to detect it
    payload: { type: String, required: true },

    // Human-readable description of what was detected
    description: { type: String, required: true },

    // Evidence: snippet of the response that confirms the finding
    evidence: { type: String, default: null },
  },
  { _id: false }
);

// ─── Main Schema ──────────────────────────────────────────────────────────────

const ScanResultSchema = new mongoose.Schema(
  {
    // The original target URL submitted for scanning
    targetUrl: {
      type: String,
      required: true,
      trim: true,
    },

    // All URLs visited during the crawl
    scannedUrls: [{ type: String }],

    // All vulnerability findings
    vulnerabilities: [VulnerabilitySchema],

    // Computed risk level based on findings
    riskLevel: {
      type: String,
      enum: ['low', 'medium', 'high'],
      default: 'low',
    },

    // Scan status
    status: {
      type: String,
      enum: ['pending', 'running', 'completed', 'failed'],
      default: 'pending',
    },

    // Error message if scan failed
    error: { type: String, default: null },

    // Duration in milliseconds
    durationMs: { type: Number, default: 0 },
  },
  {
    timestamps: true, // Adds createdAt + updatedAt automatically
    versionKey: false,
  }
);

// Index for quick lookups by target URL and creation time
ScanResultSchema.index({ targetUrl: 1, createdAt: -1 });

module.exports = mongoose.model('ScanResult', ScanResultSchema);