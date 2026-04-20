import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Globe,
  Shield,
  Clock,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Loader,
  ChevronRight,
  Home,
} from "lucide-react";
import api from "../../services/api";

const ScanDetails = () => {
  const { id } = useParams();
  const [scan, setScan] = useState(null);
  const [loading, setLoading] = useState(true);

  // ---------------- FETCH ----------------
  useEffect(() => {
    const fetchScan = async () => {
      try {
        setLoading(true);
        const res = await api.get(`/scans/${id}`);
        setScan(res.data?.scan);
      } catch (err) {
        console.error("Error fetching scan:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchScan();
  }, [id]);

  // ---------------- UI HELPERS ----------------
  const getRiskColor = (risk) => {
    if (risk === "high") return "text-red-500 bg-red-50";
    if (risk === "medium") return "text-yellow-500 bg-yellow-50";
    return "text-green-500 bg-green-50";
  };

  const getStatusIcon = (status) => {
    if (status === "completed")
      return <CheckCircle className="text-green-500" />;
    if (status === "failed") return <XCircle className="text-red-500" />;
    return <Loader className="animate-spin text-blue-500" />;
  };

  // ---------------- LOADING ----------------
  if (loading) {
    return (
      <div className="p-6 space-y-4 animate-pulse">
        <div className="h-6 w-1/3 bg-gray-200 rounded" />
        <div className="h-40 bg-gray-200 rounded-xl" />
        <div className="h-40 bg-gray-200 rounded-xl" />
      </div>
    );
  }

  if (!scan) {
    return (
      <div className="p-6 text-center text-gray-500">No scan data found</div>
    );
  }

  // ---------------- MAIN UI ----------------
  return (
    <div className="p-6 space-y-6 bg-gray-50 min-h-screen">
      {/* BREADCRUMB */}
      <div className="flex items-center text-sm text-gray-500 mb-3">
        <Home size={16} className="mr-2" />
        Home
        <ChevronRight size={16} className="mx-2" />
        <span className="text-gray-800 font-medium">Scan History</span>
        <ChevronRight size={16} className="mx-2" />
        <span className="text-gray-800 font-medium">Scan Details</span>
      </div>

      {/* HEADER */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl shadow p-5"
      >
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-xl font-bold flex items-center gap-2">
              <Globe size={18} />
              Scan Details
            </h1>
            <p className="text-sm text-gray-500 mt-1 break-all">
              {scan.targetUrl}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div
              className={`px-3 py-1 rounded-full text-sm font-medium ${getRiskColor(scan.riskLevel)}`}
            >
              {scan.riskLevel.toUpperCase()} RISK
            </div>

            <div className="flex items-center gap-1 text-sm text-gray-600">
              {getStatusIcon(scan.status)}
              {scan.status}
            </div>
          </div>
        </div>
      </motion.div>

      {/* SUMMARY CARDS */}
      <div className="grid md:grid-cols-3 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white p-4 rounded-xl shadow"
        >
          <p className="text-gray-500 text-sm">Scan Duration</p>
          <h2 className="text-lg font-bold flex items-center gap-2">
            <Clock size={16} />
            {(scan.durationMs / 1000).toFixed(2)}s
          </h2>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white p-4 rounded-xl shadow"
        >
          <p className="text-gray-500 text-sm">Scanned URLs</p>
          <h2 className="text-lg font-bold">{scan.scannedUrls?.length || 0}</h2>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white p-4 rounded-xl shadow"
        >
          <p className="text-gray-500 text-sm">Vulnerabilities</p>
          <h2 className="text-lg font-bold text-red-500">
            {scan.vulnerabilities?.length || 0}
          </h2>
        </motion.div>
      </div>

      {/* SCANNED URLS */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="bg-white rounded-xl shadow p-5"
      >
        <h2 className="font-semibold mb-3 flex items-center gap-2">
          <Globe size={16} />
          Scanned URLs
        </h2>

        <div className="space-y-2">
          {scan.scannedUrls?.map((url, i) => (
            <div key={i} className="p-2 bg-gray-50 rounded text-sm break-all">
              {url}
            </div>
          ))}
        </div>
      </motion.div>

      {/* VULNERABILITIES */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="bg-white rounded-xl shadow p-5"
      >
        <h2 className="font-semibold mb-3 flex items-center gap-2">
          <Shield size={16} />
          Vulnerabilities
        </h2>

        {scan.vulnerabilities?.length ? (
          <div className="space-y-3">
            {scan.vulnerabilities.map((vuln, i) => (
              <div key={i} className="border rounded-lg p-3 bg-red-50">
                <div className="flex items-center gap-2 text-red-600 font-medium">
                  <AlertTriangle size={14} />
                  {vuln.title || "Security Issue"}
                </div>
                <p className="text-sm text-gray-600 mt-1">
                  {vuln.description || "No description available"}
                </p>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-green-600 flex items-center gap-2">
            <CheckCircle size={16} />
            No vulnerabilities found
          </div>
        )}
      </motion.div>

      {/* FOOTER INFO */}
      <div className="text-xs text-gray-400 text-center">
        Scan ID: {scan._id} • Created:{" "}
        {new Date(scan.createdAt).toLocaleString()}
      </div>
    </div>
  );
};

export default ScanDetails;
