import React from "react";
import SidebarsContent from "./SidebarsContent";
// import { MdSecurity  } from "react-icons/gi";
import { AiOutlineClose } from "react-icons/ai";
import { BrickWallFire } from "lucide-react";

const Sidebar = ({ isOpen, toggleSidebar }) => {
  return (
    <div
      className={`scroll-container overflow-y-auto left-0 w-64 bg-white shadow fixed inset-y-0 transform transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      style={{ zIndex: 50 }}
    >
      {/* Overlay (mobile feel) */}
      <div className="absolute inset-0 bg-black/20 backdrop-blur-sm md:hidden" />

      {/* Sidebar Panel */}
      <div className="relative h-full bg-white/80 backdrop-blur-xl border-r border-gray-200 shadow-2xl px-5 py-6 flex flex-col">

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-2">
            <BrickWallFire  size={34} className="text-red-500" />
            <h1 className="text-2xl font-bold text-[#2E3A8C] tracking-wide">
              VulnGuard
            </h1>
          </div>

          <button
            onClick={toggleSidebar}
            className="p-2 rounded-lg hover:bg-gray-100 transition"
          >
            <AiOutlineClose size={22} className="text-gray-600" />
          </button>
        </div>

        {/* Menu */}
        <SidebarsContent />

        {/* Footer (optional branding) */}
        <div className="mt-auto pt-6 text-xs text-gray-400 text-center">
          © 2026 CasH Dashboard
        </div>
      </div>
    </div>
  );
};

export default Sidebar;