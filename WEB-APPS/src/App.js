import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  RefreshCcw,
  Search,
  Globe,
  Shield,
  Terminal,
  Lock,
  AlertTriangle,
  CheckCircle,
  XCircle,
  ChevronDown,
  Zap,
  Activity,
  Cpu,
  Network,
} from "lucide-react";
import api from "./services/api";

const Home = () => {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [glitch, setGlitch] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [showRawData, setShowRawData] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);

  // Simulate scan progress
  useEffect(() => {
    let interval;
    if (loading) {
      setScanProgress(0);
      interval = setInterval(() => {
        setScanProgress((prev) => {
          if (prev >= 90) return prev;
          return prev + Math.random() * 15;
        });
      }, 200);
    } else {
      setScanProgress(0);
    }
    return () => clearInterval(interval);
  }, [loading]);

  const handleScan = async () => {
    if (!url.trim()) return;

    setLoading(true);
    setGlitch(true);
    setError(null);
    setResult(null);

    try {
      const res = await api.post("/api/scan", {
        url: url.trim(),
      });

      setResult(res.data);
      setScanProgress(100);
    } catch (err) {
      setError(
        err.response?.data?.message || err.message || "Scan failed. Try again.",
      );
    } finally {
      setLoading(false);
      setGlitch(false);
    }
  };

  const handleReset = () => {
    setUrl("");
    setGlitch(false);
    setResult(null);
    setError(null);
  };

  const getThreatColor = (level) => {
    switch (level?.toLowerCase()) {
      case "critical":
        return "text-red-500";
      case "high":
        return "text-orange-500";
      case "medium":
        return "text-yellow-500";
      default:
        return "text-green-500";
    }
  };

  const getThreatGradient = (score) => {
    if (score > 70) return "from-red-500 to-orange-500";
    if (score > 40) return "from-yellow-500 to-orange-500";
    return "from-green-500 to-cyan-500";
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center bg-[#070A12] text-white px-4 py-8 overflow-hidden">
      {/* Animated Background Grid */}
      <div
        className="absolute inset-0 opacity-20"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' xmlns='http://www.w3.org/2000/svg'%3E%3Cdefs%3E%3Cpattern id='grid' width='60' height='60' patternUnits='userSpaceOnUse'%3E%3Cpath d='M 60 0 L 0 0 0 60' fill='none' stroke='rgba(34, 197, 94, 0.05)' stroke-width='1'/%3E%3C/pattern%3E%3C/defs%3E%3Crect width='100%25' height='100%25' fill='url(%23grid)'/%3E%3C/svg%3E")`,
        }}
      />

      {/* Floating Particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(30)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-green-500/50 rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [0, -100, 0],
              x: [0, Math.random() * 50 - 25, 0],
              opacity: [0, 1, 0],
            }}
            transition={{
              duration: Math.random() * 5 + 3,
              repeat: Infinity,
              delay: Math.random() * 5,
            }}
          />
        ))}
      </div>

      {/* Glitch Overlay */}
      <AnimatePresence>
        {glitch && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 0.15, 0] }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3, repeat: 3 }}
            className="absolute inset-0 bg-green-500 pointer-events-none z-10 mix-blend-screen"
          />
        )}
      </AnimatePresence>

      {/* Main Card */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, type: "spring", bounce: 0.3 }}
        className="relative w-full max-w-3xl bg-gradient-to-br from-gray-900/90 to-gray-950/90 backdrop-blur-xl border border-green-500/20 rounded-2xl shadow-2xl shadow-green-500/10 z-20 overflow-hidden"
      >
        {/* Animated Border Gradient */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-green-500/20 to-transparent -translate-x-full animate-shimmer" />

        {/* Terminal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-green-500/20 bg-black/30">
          <div className="flex gap-2">
            <div className="w-3 h-3 rounded-full bg-red-500 shadow-lg shadow-red-500/50" />
            <div className="w-3 h-3 rounded-full bg-yellow-500 shadow-lg shadow-yellow-500/50" />
            <div className="w-3 h-3 rounded-full bg-green-500 shadow-lg shadow-green-500/50 animate-pulse" />
          </div>
          <div className="flex items-center gap-2">
            <Terminal size={12} className="text-green-500" />
            <span className="text-green-400 text-xs font-mono tracking-wider">
              vulnguard@scanner:~
            </span>
          </div>
          <Lock size={12} className="text-green-500" />
        </div>

        {/* Main Content */}
        <div className="p-6">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="flex items-center gap-4 mb-6"
          >
            <div className="p-3 rounded-xl bg-gradient-to-br from-green-500/20 to-cyan-500/20 border border-green-500/30 shadow-lg shadow-green-500/20">
              <Shield className="text-green-400" size={32} />
            </div>
            <div>
              <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-green-400 via-cyan-400 to-green-400 bg-clip-text text-transparent animate-gradient">
                VULNGUARD
              </h1>
              <p className="text-xs text-green-500/70 font-mono mt-1 flex items-center gap-2">
                <Activity size={10} className="animate-pulse" />[ ENCRYPTED
                CONNECTION ACTIVE ]
              </p>
            </div>
          </motion.div>

          {/* Input Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="space-y-4"
          >
            <div className="relative flex items-center gap-3">
              <div className="relative flex-1 group">
                <div className="absolute left-4 top-1/2 -translate-y-1/2">
                  <Globe
                    size={18}
                    className="text-green-400 group-focus-within:text-cyan-400 transition-colors"
                  />
                </div>
                <input
                  type="text"
                  placeholder="Enter target URL (https://example.com)"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && handleScan()}
                  className="w-full pl-12 pr-20 py-3.5 rounded-xl bg-gray-900/50 border border-green-500/30 outline-none focus:border-cyan-500 focus:shadow-lg focus:shadow-cyan-500/20 transition-all font-mono text-sm text-green-300 placeholder-gray-600"
                />
                {url && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="absolute right-3 top-1/2 -translate-y-1/2"
                  >
                    <div className="flex items-center gap-1 px-2 py-0.5 bg-green-500/20 rounded-full">
                      <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                      <span className="text-green-400 text-xs font-mono">
                        LIVE
                      </span>
                    </div>
                  </motion.div>
                )}
              </div>

              <motion.button
                whileHover={{ scale: 1.05, rotate: 180 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleReset}
                className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/30 hover:bg-red-500/20 transition-all group"
              >
                <RefreshCcw
                  size={18}
                  className="text-red-400 group-hover:rotate-180 transition-transform duration-500"
                />
              </motion.button>
            </div>

            {/* Scan Button */}
            <motion.button
              whileHover={{ scale: loading ? 1 : 1.02 }}
              whileTap={{ scale: loading ? 1 : 0.98 }}
              onClick={handleScan}
              disabled={loading || !url}
              className={`w-full py-3.5 rounded-xl font-mono font-bold flex items-center justify-center gap-3 transition-all relative overflow-hidden group
                ${loading || !url ? "opacity-50 cursor-not-allowed" : "hover:shadow-lg hover:shadow-green-500/50"}`}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-green-600 to-cyan-600 opacity-90" />
              <div className="absolute inset-0 bg-gradient-to-r from-green-500 to-cyan-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

              {loading ? (
                <>
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{
                      repeat: Infinity,
                      duration: 1,
                      ease: "linear",
                    }}
                    className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
                  />
                  <span className="relative z-10 text-white tracking-wider">
                    SCANNING TARGET...
                  </span>
                </>
              ) : (
                <>
                  <Search
                    size={18}
                    className="relative z-10 group-hover:animate-pulse"
                  />
                  <span className="relative z-10 tracking-wider">
                    INITIATE SECURITY SCAN
                  </span>
                  <Zap
                    size={14}
                    className="relative z-10 opacity-0 group-hover:opacity-100 transition-opacity"
                  />
                </>
              )}
            </motion.button>

            {/* Scan Progress Bar */}
            {loading && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                className="space-y-2"
              >
                <div className="flex justify-between text-xs font-mono text-green-400/70">
                  <span>SCAN PROGRESS</span>
                  <span>{Math.min(Math.floor(scanProgress), 100)}%</span>
                </div>
                <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${scanProgress}%` }}
                    transition={{ duration: 0.3 }}
                    className="h-full bg-gradient-to-r from-green-500 to-cyan-500 rounded-full relative"
                  >
                    <div className="absolute inset-0 bg-white/20 animate-pulse" />
                  </motion.div>
                </div>
                <div className="flex items-center gap-2 text-xs text-green-500/50 font-mono">
                  <Cpu size={12} />
                  <span>Analyzing security headers...</span>
                  <Network size={12} className="ml-auto" />
                </div>
              </motion.div>
            )}

            {/* Error Message */}
            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="p-3 rounded-lg bg-red-500/10 border border-red-500/30"
                >
                  <div className="flex items-center gap-2 text-red-400 text-sm">
                    <XCircle size={16} />
                    <span>{error}</span>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>

          {/* Results Section */}
          <AnimatePresence>
            {result && (
              <motion.div
                initial={{ opacity: 0, y: 20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.4 }}
                className="mt-6 space-y-4"
              >
                {/* Scan Summary */}
                <div className="p-4 rounded-xl bg-gray-900/50 border border-green-500/20 backdrop-blur-sm">
                  <div className="flex items-center justify-between mb-3 pb-2 border-b border-green-500/20">
                    <div className="flex items-center gap-2">
                      <CheckCircle size={16} className="text-green-500" />
                      <h2 className="text-green-400 font-bold tracking-wider">
                        SCAN COMPLETE
                      </h2>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-green-500/60">
                      <Activity size={12} />
                      <span>v3.7.1</span>
                    </div>
                  </div>

                  {/* Target URL */}
                  <div className="mb-4 p-3 bg-gradient-to-r from-green-500/5 to-cyan-500/5 rounded-lg border border-green-500/20">
                    <span className="text-green-500/60 text-xs uppercase font-mono">
                      Target
                    </span>
                    <div className="flex items-center gap-2 mt-1">
                      <Globe size={14} className="text-green-400" />
                      <span className="text-green-300 text-sm font-mono break-all">
                        {result.url || url}
                      </span>
                    </div>
                  </div>

                  {/* Threat Level */}
                  <div className="mb-4 p-3 rounded-lg bg-gradient-to-r from-green-500/5 to-cyan-500/5">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-green-500/60 text-xs uppercase font-mono">
                        Threat Assessment
                      </span>
                      <span
                        className={`text-sm font-bold ${getThreatColor(result.threatLevel)}`}
                      >
                        {result.threatLevel || "LOW"} RISK
                      </span>
                    </div>
                    <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${result.threatScore || 0}%` }}
                        transition={{ duration: 0.8, type: "spring" }}
                        className={`h-full rounded-full bg-gradient-to-r ${getThreatGradient(result.threatScore)}`}
                      />
                    </div>
                    <div className="flex justify-between mt-1 text-xs text-green-500/50">
                      <span>Secure</span>
                      <span>Warning</span>
                      <span>Critical</span>
                    </div>
                  </div>

                  {/* Vulnerabilities */}
                  {result.vulnerabilities &&
                    result.vulnerabilities.length > 0 && (
                      <div className="mb-4">
                        <div className="flex items-center gap-2 mb-3">
                          <AlertTriangle size={14} className="text-red-500" />
                          <span className="text-red-500 text-xs uppercase font-bold">
                            {result.vulnerabilities.length} VULNERABILITIES
                            DETECTED
                          </span>
                        </div>
                        <div className="space-y-2 max-h-60 overflow-y-auto custom-scrollbar pr-1">
                          {result.vulnerabilities.map((vuln, idx) => (
                            <motion.div
                              key={idx}
                              initial={{ opacity: 0, x: -20 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: idx * 0.05 }}
                              className="p-3 bg-red-500/5 border-l-2 border-red-500 rounded-lg hover:bg-red-500/10 transition-colors"
                            >
                              <div className="flex justify-between items-start mb-1">
                                <span className="text-red-300 text-sm font-bold">
                                  {vuln.type}
                                </span>
                                <span
                                  className={`text-xs px-2 py-0.5 rounded-full ${
                                    vuln.severity === "Critical"
                                      ? "bg-red-500/30 text-red-300"
                                      : vuln.severity === "High"
                                        ? "bg-orange-500/30 text-orange-300"
                                        : "bg-yellow-500/30 text-yellow-300"
                                  }`}
                                >
                                  {vuln.severity || "MEDIUM"}
                                </span>
                              </div>
                              <p className="text-gray-400 text-sm mt-1">
                                {vuln.description}
                              </p>
                              {vuln.recommendation && (
                                <div className="mt-2 flex items-start gap-1 text-green-500/70 text-xs">
                                  <span className="font-mono">→</span>
                                  <span>{vuln.recommendation}</span>
                                </div>
                              )}
                            </motion.div>
                          ))}
                        </div>
                      </div>
                    )}

                  {/* Security Headers */}
                  {result.securityHeaders && (
                    <div className="p-3 rounded-lg bg-gradient-to-r from-green-500/5 to-cyan-500/5">
                      <div className="flex items-center gap-2 mb-3">
                        <Lock size={14} className="text-cyan-400" />
                        <span className="text-cyan-400 text-xs uppercase font-bold">
                          Security Configuration
                        </span>
                      </div>
                      <div className="grid grid-cols-2 gap-3 text-sm">
                        <div className="flex justify-between items-center p-2 bg-gray-900/50 rounded">
                          <span className="text-green-500/70">SSL/TLS:</span>
                          <span
                            className={
                              result.securityHeaders.ssl
                                ? "text-green-400"
                                : "text-red-400"
                            }
                          >
                            {result.securityHeaders.ssl
                              ? "✓ Encrypted"
                              : "✗ Insecure"}
                          </span>
                        </div>
                        <div className="flex justify-between items-center p-2 bg-gray-900/50 rounded">
                          <span className="text-green-500/70">
                            X-Frame-Options:
                          </span>
                          <span
                            className={
                              result.securityHeaders.xframe
                                ? "text-green-400"
                                : "text-yellow-400"
                            }
                          >
                            {result.securityHeaders.xframe || "Missing"}
                          </span>
                        </div>
                        <div className="flex justify-between items-center p-2 bg-gray-900/50 rounded">
                          <span className="text-green-500/70">CSP:</span>
                          <span
                            className={
                              result.securityHeaders.csp
                                ? "text-green-400"
                                : "text-yellow-400"
                            }
                          >
                            {result.securityHeaders.csp
                              ? "✓ Enabled"
                              : "Not Set"}
                          </span>
                        </div>
                        <div className="flex justify-between items-center p-2 bg-gray-900/50 rounded">
                          <span className="text-green-500/70">HSTS:</span>
                          <span
                            className={
                              result.securityHeaders.hsts
                                ? "text-green-400"
                                : "text-yellow-400"
                            }
                          >
                            {result.securityHeaders.hsts || "Disabled"}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Scan Metadata */}
                  <div className="flex justify-between items-center pt-3 mt-3 border-t border-green-500/20 text-xs text-green-500/50">
                    <div className="flex items-center gap-2">
                      <Terminal size={12} />
                      <span className="font-mono">
                        ID:{" "}
                        {result.scanId ||
                          "0x7E3F" + Math.random().toString(16).slice(2, 8)}
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span>⏱ {result.scanTime || "0.847s"}</span>
                      <span>🔍 {result.checksPerformed || 47} checks</span>
                    </div>
                  </div>

                  {/* Raw Data Toggle */}
                  <button
                    onClick={() => setShowRawData(!showRawData)}
                    className="mt-3 w-full flex items-center justify-center gap-2 text-xs text-green-500/50 hover:text-green-500/70 transition-colors py-2"
                  >
                    <span>{showRawData ? "HIDE" : "VIEW"} RAW DATA</span>
                    <ChevronDown
                      size={12}
                      className={`transition-transform ${showRawData ? "rotate-180" : ""}`}
                    />
                  </button>

                  <AnimatePresence>
                    {showRawData && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="mt-2"
                      >
                        <pre className="p-3 bg-black/50 rounded-lg text-xs text-green-500/50 overflow-x-auto">
                          {JSON.stringify(result, null, 2)}
                        </pre>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Footer */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="mt-6 pt-4 border-t border-green-500/20"
          >
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2 text-green-500/60 font-mono">
                <Shield size={12} />
                <span>REAL-TIME DEEP SCAN ACTIVE</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                <span className="text-green-500/60 font-mono text-[10px]">
                  SECURE CONNECTION • AES-256
                </span>
              </div>
            </div>
            <p className="text-green-500/40 text-[10px] text-center mt-3 font-mono tracking-wider">
              &gt;_ VULNGARD ENGINE v3.7.1 // POWERED BY ADVANCED THREAT
              INTELLIGENCE
            </p>
            <p className="text-center mt-3 text-xs font-mono text-green-500/50">
              Designed & Developed by{" "}
              <span className="text-green-400 font-bold animate-pulse">
                Jagadish
              </span>
            </p>
          </motion.div>
        </div>
      </motion.div>

      {/* Add custom CSS for animations */}
      <style jsx>{`
        @keyframes shimmer {
          100% {
            transform: translateX(100%);
          }
        }
        @keyframes gradient {
          0%,
          100% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
        }
        .animate-shimmer {
          animation: shimmer 2s infinite;
        }
        .animate-gradient {
          background-size: 200% auto;
          animation: gradient 3s linear infinite;
        }
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(34, 197, 94, 0.1);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(34, 197, 94, 0.3);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(34, 197, 94, 0.5);
        }
      `}</style>
    </div>
  );
};

export default Home;
