/**
 * server.js — Entry point for the Web Vulnerability Scanner
 * Initializes Express, connects to MongoDB, and registers routes.
 */

"use strict";

require("dotenv").config();

const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const { logger } = require("./utils/logger");
const scanRoutes = require("./routes/scan.routes");
const authRoutes = require("./routes/authRoutes");

const app = express();
const PORT = process.env.PORT || 3000;
const MONGODB_URI =
  process.env.MONGODB_URI || "mongodb://localhost:27017/vuln_scanner";

// ─── Middleware ────────────────────────────────────────────────────────────────
app.use(
  cors({
    origin: "*", // allow all (for development)
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  }),
);
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

// Basic request logger
app.use((req, _res, next) => {
  logger.info(`${req.method} ${req.path}`, { ip: req.ip });
  next();
});

// ─── Routes ───────────────────────────────────────────────────────────────────
app.use("/api", scanRoutes);
app.use("/api/auth", authRoutes);

// Health check
app.get("/health", (_req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// 404 handler
app.use((_req, res) => {
  res.status(404).json({ success: false, error: "Route not found" });
});

// Global error handler
app.use((err, _req, res, _next) => {
  logger.error("Unhandled error", { error: err.message, stack: err.stack });
  res.status(500).json({ success: false, error: "Internal server error" });
});

// ─── Database + Server Start ──────────────────────────────────────────────────
async function bootstrap() {
  try {
    await mongoose.connect(MONGODB_URI, {
      serverSelectionTimeoutMS: 5000,
    });
    logger.info("MongoDB connected", { uri: MONGODB_URI });
  } catch (err) {
    logger.warn("MongoDB connection failed — results will not be persisted", {
      error: err.message,
    });
    // Allow server to run without MongoDB (graceful degradation)
  }

  app.listen(PORT, () => {
    logger.info(`Vulnerability Scanner API running on port ${PORT}`);
    logger.info(`POST http://localhost:${PORT}/api/scan`);
  });
}

bootstrap();

module.exports = app;
