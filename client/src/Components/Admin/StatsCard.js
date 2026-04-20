const variants = {
  blue: {
    bg: "bg-gradient-to-br from-blue-50 to-blue-100",
    icon: "bg-blue-500 text-white",
    text: "text-blue-900",
  },
  red: {
    bg: "bg-gradient-to-br from-red-50 to-red-100",
    icon: "bg-red-500 text-white",
    text: "text-red-900",
  },
  green: {
    bg: "bg-gradient-to-br from-green-50 to-green-100",
    icon: "bg-green-500 text-white",
    text: "text-green-900",
  },
  yellow: {
    bg: "bg-gradient-to-br from-yellow-50 to-yellow-100",
    icon: "bg-yellow-500 text-white",
    text: "text-yellow-900",
  },
};

export default function StatsCard({ title, value, icon, color }) {
  const style = variants[color];

  return (
    <div
      className={`
        p-6 rounded-2xl ${style.bg}
        
        /* ✅ Soft Border */
        border border-gray-200/60
        
        /* ✅ Premium Shadow (layered) */
        shadow-[0_4px_12px_rgba(0,0,0,0.05),0_1px_2px_rgba(0,0,0,0.04)]
        
        /* ✅ Inner Glow */
        ring-1 ring-white/40
        
        /* ✅ Interaction */
        hover:shadow-[0_10px_25px_rgba(0,0,0,0.08)]
        hover:-translate-y-1
        
        transition-all duration-300
      `}
    >
      <div className="flex items-center justify-between mb-6">
        <div className={`p-3 rounded-xl shadow-sm ${style.icon}`}>
          {icon}
        </div>
      </div>

      <p className="text-sm text-gray-600">{title}</p>

      <h2 className={`text-3xl font-bold mt-1 ${style.text}`}>
        {value}
      </h2>
    </div>
  );
}