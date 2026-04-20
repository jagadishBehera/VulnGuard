// pages/Scan.jsx
import { useState } from "react";
import ScanForm from ".././../Components/Admin/ScanForm";
import ScanProgress from "../../Components/Admin/ScanProgress";
import VulnerabilityTable from "../../Components/Admin/VulnerabilityTable";
import SafeResult from "../../Components/Admin/SafeResult";
import { ChevronRight, Home } from "lucide-react";

export default function Scan() {
  const [scanning, setScanning] = useState(false);
  const [results, setResults] = useState(null);

  return (
    <div className="p-6">

      {/* Breadcrumb */}
      <div className="flex items-center text-sm text-gray-500 mb-2">
        <Home size={16} className="mr-2" />
        <span className="hover:text-gray-700 cursor-pointer">Home</span>
        <ChevronRight size={16} className="mx-2" />
        <span className="text-gray-800 font-medium">Scan</span>
      </div>


      <ScanForm setScanning={setScanning} setResults={setResults} />

      {scanning && <ScanProgress />}


      {results?.vulnerabilities?.length > 0 && (
        <VulnerabilityTable data={results.vulnerabilities} />
      )}


      {results &&
        results?.vulnerabilities?.length === 0 &&
        !scanning && (
          <SafeResult targetUrl={results.targetUrl} />
        )}
    </div>
  );
}