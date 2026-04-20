/**
 * utils/riskCalculator.js — Determines overall scan risk level
 * based on the type and quantity of vulnerabilities found.
 */

'use strict';

/**
 * Severity weights for each vulnerability type.
 * Higher = more critical.
 */
const SEVERITY_WEIGHTS = {
  xss: 3,           // High: direct client-side code execution
  sqli: 4,          // Critical: database compromise
  sqli_timing: 4,   // Critical: blind SQL injection
  error_info: 1,    // Low: information disclosure
};

/**
 * Calculates a risk level string from an array of vulnerability findings.
 * @param {Array<{ type: string }>} vulnerabilities
 * @returns {'low' | 'medium' | 'high'}
 */
function calculateRiskLevel(vulnerabilities) {
  if (!vulnerabilities || vulnerabilities.length === 0) return 'low';

  // Sum weighted severity scores
  const totalScore = vulnerabilities.reduce((sum, vuln) => {
    const weight = SEVERITY_WEIGHTS[vuln.type] || 1;
    return sum + weight;
  }, 0);

  // Thresholds
  if (totalScore >= 8) return 'high';
  if (totalScore >= 3) return 'medium';
  return 'low';
}

module.exports = { calculateRiskLevel };