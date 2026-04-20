import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { BiSolidDashboard } from "react-icons/bi";
import { FaUserTie } from "react-icons/fa";
import { MdCardMembership } from "react-icons/md";

const SidebarsContent = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [active, setActive] = useState(location.pathname);

  useEffect(() => {
    setActive(location.pathname);
  }, [location.pathname]);

  const menuItems = [
    {
      path: "/admin/dashboard",
      label: "Dashboard",
      icon: <BiSolidDashboard />,
    },
    {
      path: "/admin/scan",
      label: "Scan",
      icon: <FaUserTie />,
    },
    {
      path: "/admin/history",
      label: "History",
      icon: <MdCardMembership />,
    },
  ];

  const handleNavigate = (path) => {
    navigate(path);
    setActive(path);
  };

  return (
    <div className="flex flex-col gap-2">
      {menuItems.map((item) => {
        const isActive = active === item.path;

        return (
          <button
            key={item.path}
            onClick={() => handleNavigate(item.path)}
            className={`group relative flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300
              ${isActive
                ? "bg-gradient-to-r from-[#2E3A8C] to-[#4F68A4] text-white shadow-lg"
                : "text-gray-600 hover:bg-gray-100 hover:text-[#2E3A8C]"
              }
            `}
          >
            {/* Active Indicator Bar */}
            <span
              className={`absolute left-0 top-2 bottom-2 w-1 rounded-r-full transition-all
                ${isActive
                  ? "bg-red-400"
                  : "bg-transparent group-hover:bg-gray-300"
                }
              `}
            />

            {/* Icon */}
            <span
              className={`text-xl transition-transform duration-300 ${isActive ? "scale-110" : "group-hover:scale-105"
                }`}
            >
              {item.icon}
            </span>

            {/* Label */}
            <span className="font-medium tracking-wide">{item.label}</span>
          </button>
        );
      })}
    </div>
  );
};

export default SidebarsContent;