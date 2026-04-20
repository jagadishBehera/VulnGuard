// components/RiskBadge.jsx
export default function RiskBadge({ level }) {
  const l = (level || "").toLowerCase();

  const styles = {
    critical: "bg-red-600 shadow-red-500/40 text-white",
    high: "bg-red-500 shadow-red-400/30 text-white",
    medium: "bg-yellow-500 shadow-yellow-400/30 text-black",
    low: "bg-green-500 shadow-green-400/30 text-white",
    info: "bg-blue-500 shadow-blue-400/30 text-white",
  };

  return (
    <span
      className={`px-3 py-1 rounded-full text-xs font-semibold capitalize
      shadow-md tracking-wide transition-all hover:scale-105
      ${styles[l] || "bg-gray-400 text-white"}`}
    >
      {l}
    </span>
  );
}