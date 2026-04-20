import React, { useEffect, useState } from 'react';
import { AiOutlineMenuUnfold } from 'react-icons/ai';
import { FaBell, FaRegCalendarAlt, FaClock } from 'react-icons/fa';
import AdminProfileDropDown from '../../Components/Admin/AdminProfileDropDown';

const Navbar = ({ toggleSidebar }) => {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const financialYear = (() => {
    const year = currentTime.getFullYear();
    const month = currentTime.getMonth() + 1;
    return month >= 4 ? `${year}-${year + 1}` : `${year - 1}-${year}`;
  })();

  return (
    <div
      id="nav"
      className="w-full h-16 bg-white flex items-center text-[#49608c] shadow z-50 sticky top-4 px-4"
    >
      {/* Left Menu */}
      <div className="flex items-center">
        <AiOutlineMenuUnfold
          className="transition hover:text-[#2E3A8C] duration-300 mr-5 cursor-pointer"
          onClick={toggleSidebar}
          size={25}
        />
      </div>

      {/* Center Info */}
      <div className="hidden md:flex items-center gap-6 ml-6 text-sm font-medium text-gray-600">
        {/* Financial Year */}
        <div className="flex items-center gap-2 bg-gray-100 px-3 py-1 rounded-full">
          <FaRegCalendarAlt />
          <span>FY: {financialYear}</span>
        </div>

        {/* Live Time */}
        <div className="flex items-center gap-2 bg-gray-100 px-3 py-1 rounded-full">
          <FaClock />
          <span>
            {currentTime.toLocaleTimeString('en-IN', {
              hour: '2-digit',
              minute: '2-digit',
              second: '2-digit',
            })}
          </span>
        </div>
      </div>

      {/* Right Side */}
      <div className="ml-auto flex items-center gap-4">
        <div className="relative transition hover:text-[#2E3A8C] duration-300 cursor-pointer">
          <FaBell size={22} />
        </div>

        <AdminProfileDropDown />
      </div>
    </div>
  );
};

export default Navbar;