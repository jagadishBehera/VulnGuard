import { ShieldCheck, CheckCircle2 } from "lucide-react";

export default function SafeResult({ targetUrl }) {
  return (
    <div className="mt-6">
      <div className="rounded-2xl border border-green-200 bg-green-50 p-6 shadow-sm flex items-center gap-4">
        
        {/* Icon Section */}
        <div className="relative">
          <ShieldCheck size={42} className="text-green-600" />
          <span className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full animate-ping" />
        </div>

        {/* Text Section */}
        <div className="flex-1">
          <h2 className="text-lg font-semibold text-green-800 flex items-center gap-2">
            No Vulnerabilities Found
            <CheckCircle2 size={18} className="text-green-600" />
          </h2>

          <p className="text-sm text-green-700 mt-1">
            Target <span className="font-medium">{targetUrl}</span> appears secure based on current scan.
          </p>

          <p className="text-xs text-green-600 mt-2">
            ✔ Headers validated • ✔ Injection tests passed • ✔ XSS checks clean
          </p>
        </div>
      </div>
    </div>
  );
}