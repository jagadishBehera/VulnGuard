import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  RefreshCcw,
  Search,
  Globe,
  Shield,
  Terminal,
  Lock,
  AlertTriangle,
} from "lucide-react";

const Home = () => {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [glitch, setGlitch] = useState(false);

  const handleScan = async () => {
    if (!url.trim()) return;

    setLoading(true);
    setGlitch(true);

    // simulate API call
    setTimeout(() => {
      setLoading(false);
      setGlitch(false);
      alert(`🛡️ Scanning started for: ${url}\n🔒 VulnGuard Engine Active`);
    }, 1500);
  };

  const handleReset = () => {
    setUrl("");
    setGlitch(false);
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center bg-gradient-to-br from-black via-gray-950 to-green-950/30 text-white px-4 overflow-hidden">
      {/* Animated Matrix Background */}
      <div className="absolute inset-0 overflow-hidden opacity-20">
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute text-green-500 font-mono text-sm"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              fontSize: `${Math.random() * 20 + 10}px`,
            }}
            animate={{
              y: [0, -1000],
              opacity: [1, 0],
            }}
            transition={{
              duration: Math.random() * 5 + 5,
              repeat: Infinity,
              delay: Math.random() * 5,
            }}
          >
            {String.fromCharCode(0x30a0 + Math.random() * 100)}
          </motion.div>
        ))}
      </div>

      {/* Glitch Overlay */}
      {glitch && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: [0, 0.1, 0] }}
          transition={{ duration: 0.3, repeat: 5 }}
          className="absolute inset-0 bg-green-500 pointer-events-none z-10"
        />
      )}

      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="relative w-full max-w-2xl bg-black/70 backdrop-blur-xl border border-green-500/30 rounded-2xl p-6 shadow-2xl shadow-green-500/20 z-20"
      >
        {/* Terminal Header Bar */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="flex items-center justify-between mb-4 pb-2 border-b border-green-500/30"
        >
          <div className="flex gap-2">
            <div className="w-3 h-3 rounded-full bg-red-500 shadow-lg shadow-red-500/50" />
            <div className="w-3 h-3 rounded-full bg-yellow-500 shadow-lg shadow-yellow-500/50" />
            <div className="w-3 h-3 rounded-full bg-green-500 shadow-lg shadow-green-500/50 animate-pulse" />
          </div>
          <span className="text-green-400 text-xs font-mono tracking-wider">
            vulnguard@scanner:~
          </span>
          <Lock size={14} className="text-green-500" />
        </motion.div>

        {/* Header */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="flex items-center gap-3 mb-6"
        >
          <div className="p-2 rounded-lg bg-green-500/10 border border-green-500/50">
            <Shield className="text-green-400" size={28} />
          </div>
          <div>
            <h1 className="text-2xl font-mono font-bold tracking-tight bg-gradient-to-r from-green-400 to-cyan-400 bg-clip-text text-transparent">
              VULNGUARD SECURE SCANNER
            </h1>
            <p className="text-xs text-green-500/70 font-mono mt-1">
              [ ENCRYPTED CONNECTION ACTIVE ]
            </p>
          </div>
        </motion.div>

        {/* Input Box */}
        <div className="relative flex items-center gap-2">
          <div className="relative flex-1">
            <div className="absolute left-3 top-1/2 -translate-y-1/2">
              <Terminal size={18} className="text-green-400" />
            </div>
            <input
              type="text"
              placeholder=">_ Enter target URL (https://example.com)"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className="w-full pl-10 pr-4 py-3 rounded-lg bg-black/60 border border-green-500/30 outline-none focus:border-green-400 focus:shadow-lg focus:shadow-green-500/20 transition-all font-mono text-sm text-green-300 placeholder-green-800/50"
            />
            <motion.div
              animate={{ opacity: [0, 1, 0] }}
              transition={{ duration: 1, repeat: Infinity }}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-green-500 text-xs font-mono"
            >
              {url && "LIVE"}
            </motion.div>
          </div>

          {/* Reset Button */}
          <motion.button
            whileHover={{ scale: 1.05, rotate: 180 }}
            whileTap={{ scale: 0.9 }}
            onClick={handleReset}
            className="p-3 rounded-lg bg-red-500/10 border border-red-500/30 hover:bg-red-500/20 transition-all group"
          >
            <RefreshCcw
              size={18}
              className="text-red-400 group-hover:rotate-180 transition-transform duration-500"
            />
          </motion.button>
        </div>

        {/* Scan Button */}
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleScan}
          disabled={loading}
          className={`w-full mt-6 py-3 rounded-lg font-mono font-bold flex items-center justify-center gap-2 transition-all relative overflow-hidden group
            ${loading ? "bg-green-600/30 cursor-not-allowed" : "bg-gradient-to-r from-green-600 to-cyan-600 hover:shadow-lg hover:shadow-green-500/50"}`}
        >
          {loading ? (
            <>
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                className="w-5 h-5 border-2 border-green-400 border-t-transparent rounded-full"
              />
              <span className="text-green-300">INITIALIZING SCAN...</span>
            </>
          ) : (
            <>
              <Search size={18} className="group-hover:animate-pulse" />
              <span className="tracking-wider">[ START SECURITY SCAN ]</span>
              <Shield
                size={14}
                className="opacity-0 group-hover:opacity-100 transition-opacity"
              />
            </>
          )}
        </motion.button>

        {/* Threat Level Indicator */}
        <motion.div
          initial={{ opacity: 0, width: 0 }}
          animate={{ opacity: 1, width: "100%" }}
          transition={{ delay: 0.5 }}
          className="mt-4 p-3 rounded-lg bg-black/40 border border-green-500/20"
        >
          <div className="flex justify-between text-xs font-mono text-green-400/70 mb-1">
            <span>THREAT LEVEL</span>
            <span>SCAN READY</span>
          </div>
          <div className="h-1 bg-gray-800 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: loading ? "100%" : "5%" }}
              transition={{ duration: loading ? 1.5 : 0 }}
              className="h-full bg-gradient-to-r from-green-500 to-red-500 rounded-full"
            />
          </div>
        </motion.div>

        {/* Footer hint */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="mt-5 pt-3 border-t border-green-500/20"
        >
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-2 text-green-500/60 font-mono">
              <AlertTriangle size={12} />
              <span>REAL-TIME DEEP SCAN ACTIVE</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
              <span className="text-green-500/60 font-mono text-[10px]">
                SECURE CONNECTION • AES-256
              </span>
            </div>
          </div>
          <p className="text-green-500/40 text-[10px] text-center mt-2 font-mono tracking-wider">
            {
              ">_ VULNGARD ENGINE v3.7.1 // POWERED BY ADVANCED THREAT INTELLIGENCE"
            }
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="mt-5 text-center"
        >
          <p className="text-[11px] font-mono text-green-500/50 tracking-widest">
            Designed & Developed by{" "}
            <span className="text-green-400 font-bold animate-pulse">
              Jagadish
            </span>
          </p>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default Home;
