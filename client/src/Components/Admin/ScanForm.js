import { useState } from "react";
import { Shield, Radar, Loader2, Link2, RotateCcw } from "lucide-react";
import api from "../../services/api";

export default function ScanForm({ setScanning, setResults }) {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [resetting, setResetting] = useState(false);

  const handleScan = async () => {
    if (!url.trim()) return;

    setScanning(true);
    setLoading(true);

    try {
      const res = await api.post("/scan", { url });

      const data = res.data;

      const formatted = {
        success: data.success,
        scanId: data.scanId,
        targetUrl: data.targetUrl,
        riskLevel: data.riskLevel,
        vulnerabilities: data.vulnerabilities || [],
        scannedUrls: data.scannedUrls || [],
        summary: data.summary || {},
      };

      if (formatted.success) {
        setResults(formatted);
      }
    } catch (err) {
      console.error("Scan failed:", err.message);
    } finally {
      setScanning(false);
      setLoading(false);
    }
  };

  // 🔄 RESET FUNCTION
  const handleReset = () => {
    setResetting(true);

    setTimeout(() => {
      setUrl("");
      setResults(null);
      setScanning(false);
      setResetting(false);
    }, 400);
  };

  return (
    <div className="w-full mb-6">
      <div className="flex items-center gap-3 border border-gray-200 bg-white rounded-xl px-4 py-3 focus-within:border-indigo-500 transition shadow-sm">
        {/* Security Icon */}
        <Shield className="text-indigo-600" size={20} />

        {/* Input */}
        <input
          type="text"
          placeholder="https://example.com"
          className="flex-1 outline-none text-sm"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
        />

        {/* Scan Button */}
        <button
          onClick={handleScan}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 transition disabled:opacity-60"
        >
          {loading ? (
            <>
              <Radar className="animate-pulse" size={16} />
              Scanning
            </>
          ) : (
            <>
              <Link2 size={16} />
              Scan
            </>
          )}
        </button>

        {/* RESET BUTTON */}
        <button
          onClick={handleReset}
          disabled={loading}
          className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition 
    ${
      loading
        ? "opacity-40 cursor-not-allowed"
        : "text-gray-600 hover:text-red-600 hover:bg-red-50"
    }`}
        >
          <RotateCcw
            size={16}
            className={`${resetting ? "animate-spin" : ""}`}
          />
        </button>
      </div>

      {/* Helper text */}
      <p className="text-xs text-gray-500 mt-2 flex items-center gap-1">
        <Shield size={12} className="text-gray-400" />
        Enter a valid URL (https required)
      </p>
    </div>
  );
}
