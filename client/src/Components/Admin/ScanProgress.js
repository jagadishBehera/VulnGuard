import { useEffect, useState } from "react";
import { ShieldX } from "lucide-react";

const steps = [
  "Initializing scanner...",
  "Crawling endpoints...",
  "Testing SQL Injection...",
  "Checking XSS vulnerabilities...",
  "Analyzing headers...",
  "Finalizing report...",
];

export default function ScanProgress() {
  const [progress, setProgress] = useState(8);
  const [stepIndex, setStepIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 95) return 100;
        return prev + (100 - prev) * 0.08;
      });
      setStepIndex((prev) => (prev < steps.length - 1 ? prev + 1 : prev));
    }, 1200);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative mb-6">
      {/* Gradient Border Wrapper */}
      <div className="p-[1px] rounded-2xl bg-gradient-to-r from-[#2E3A8C] to-[#4F68A4]">
        {/* Glass Card */}
        <div className="rounded-2xl bg-white/70 backdrop-blur-xl p-6 shadow-lg">
          {/* Header */}
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-3">
              <div className="relative">
                <ShieldX className="text-inigo-400" size={26} />

                {/* Pulse Dot */}
                <span className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full animate-ping"></span>
                <span className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full"></span>
              </div>

              <div>
                <h2 className="text-lg font-semibold text-gray-800">
                  Security Scan Running
                </h2>
                <p className="text-sm text-gray-500">
                  Deep vulnerability analysis in progress
                </p>
              </div>
            </div>

            {/* Percentage */}
            <span className="text-sm font-semibold text-inigo-400">
              {Math.min(progress.toFixed(0), 100)}%
            </span>
          </div>

          {/* Progress Bar */}
          <div className="relative w-full h-2 rounded-full bg-gray-200 overflow-hidden mb-4">
            <div
              style={{ width: `${progress}%` }}
              className="h-full rounded-full bg-gradient-to-r from-[#2E3A8C] to-[#4F68A4] transition-all duration-500"
            />

            {/* Glow effect */}
            <div
              style={{ width: `${progress}%` }}
              className="absolute top-0 h-full blur-md opacity-40 bg-indigo-400"
            />
          </div>

          {/* Step Text */}
          <div className="flex items-center justify-between">
            <p className="text-sm text-indigo-600 font-medium animate-pulse">
              {steps[stepIndex]}
            </p>

            <span className="text-xs text-gray-400">Please wait...</span>
          </div>
        </div>
      </div>

      {/* Animation */}
      <style>
        {`
          .animate-spin-slow {
            animation: spin 6s linear infinite;
          }
        `}
      </style>
    </div>
  );
}
