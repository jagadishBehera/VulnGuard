# 🔍 Web Vulnerability Scanner

A production-grade web vulnerability scanner built with Node.js, Express, Axios, Puppeteer, and MongoDB. Detects **XSS** and **SQL Injection** vulnerabilities by crawling target websites and injecting test payloads.

> ⚠️ **Legal Notice**: Only scan websites you own or have explicit written permission to test. Unauthorized scanning may violate computer crime laws.

---

## Architecture

```
vuln-scanner/
├── server.js                  # Express entry point
├── routes/
│   └── scan.routes.js         # API route definitions + rate limiter
├── controllers/
│   └── scanController.js      # Request validation, response formatting
├── services/
│   ├── scanEngine.js          # Orchestrates scan phases with concurrency
│   ├── crawler.js             # HTML crawler (Axios + Puppeteer fallback)
│   ├── xssScanner.js          # XSS detection via payload reflection
│   ├── sqliScanner.js         # SQLi detection (error, boolean, timing)
│   └── httpClient.js          # Axios wrapper with timeout + error handling
├── models/
│   └── ScanResult.js          # Mongoose schema for persisting results
└── utils/
    ├── logger.js              # Winston structured logger
    ├── urlUtils.js            # URL parsing, injection, validation helpers
    └── riskCalculator.js      # Computes risk level from findings
```

---

## Prerequisites

- Node.js ≥ 18
- MongoDB (optional — server degrades gracefully without it)
- Chromium (auto-installed by Puppeteer)

---

## Setup

```bash
# 1. Install dependencies
npm install

# 2. Configure environment
cp .env.example .env
# Edit .env with your MongoDB URI and preferences

# 3. Start server
npm start          # production
npm run dev        # development (nodemon)
```

---

## API Reference

### `POST /api/scan`

Starts a vulnerability scan against a target URL.

**Request:**
```json
{
  "url": "https://testphp.vulnweb.com"
}
```

**Response:**
```json
{
  "success": true,
  "scanId": "64f1a2b3c4d5e6f7a8b9c0d1",
  "targetUrl": "https://testphp.vulnweb.com",
  "vulnerabilities": [
    {
      "type": "sqli",
      "severity": "critical",
      "url": "https://testphp.vulnweb.com/listproducts.php",
      "parameter": "cat",
      "payload": "' OR 1=1 --",
      "description": "Error-based SQL Injection: DB error pattern...",
      "evidence": "...mysql_fetch_array() expects param..."
    }
  ],
  "scannedUrls": ["https://testphp.vulnweb.com/", "..."],
  "riskLevel": "high",
  "summary": {
    "totalUrls": 12,
    "totalVulnerabilities": 3,
    "xssCount": 1,
    "sqliCount": 2,
    "durationMs": 18432
  }
}
```

### `GET /api/scans`

Returns the 20 most recent scan results.

### `GET /api/scans/:id`

Returns a specific scan result by ID.

### `GET /health`

Returns server health status.

---

## Vulnerability Detection

### XSS (Cross-Site Scripting)
- **Method**: Reflected payload detection
- **Payloads**: 6 variants including script tags, event handlers, SVG
- **Surface**: URL query parameters + HTML form fields
- **Detection**: Checks if unescaped payload appears in response body

### SQL Injection
Three detection strategies:

| Strategy | Description | Payloads |
|---|---|---|
| **Error-based** | Triggers DB error messages | `'`, `' OR 1=1 --`, UNION SELECT, ORDER BY |
| **Boolean-based** | Compares true vs false condition responses | `' OR '1'='1` vs `' OR '1'='2` |
| **Time-based (Blind)** | Measures SLEEP/WAITFOR delays | `SELECT SLEEP(5)`, `WAITFOR DELAY '0:0:5'` |

Supports: **MySQL, MSSQL, PostgreSQL, Oracle, SQLite**

---

## Configuration (`.env`)

| Variable | Default | Description |
|---|---|---|
| `PORT` | `3000` | Server port |
| `MONGODB_URI` | `mongodb://localhost:27017/vuln_scanner` | MongoDB connection string |
| `MAX_CONCURRENT_REQUESTS` | `5` | Max parallel HTTP requests |
| `REQUEST_TIMEOUT_MS` | `10000` | Per-request timeout (ms) |
| `CRAWL_DEPTH` | `2` | How deep to follow links |
| `MAX_URLS_PER_SCAN` | `50` | Maximum URLs to crawl per scan |

---

## Test Targets (Legal)

- [https://testphp.vulnweb.com](https://testphp.vulnweb.com) — Acunetix demo (SQLi + XSS)
- [https://demo.testfire.net](https://demo.testfire.net) — IBM demo app
- [https://juice-shop.herokuapp.com](https://juice-shop.herokuapp.com) — OWASP Juice Shop

---

## Risk Levels

| Level | Criteria |
|---|---|
| `low` | No findings, or only informational |
| `medium` | 1–2 medium-severity findings |
| `high` | Any SQL injection, or multiple XSS findings |

---

## Example `curl` Command

```bash
curl -X POST http://localhost:3000/api/scan \
  -H "Content-Type: application/json" \
  -d '{"url": "https://testphp.vulnweb.com"}'
```