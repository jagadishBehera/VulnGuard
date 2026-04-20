import React, { useState } from "react";
import { PiUserCircleDuotone } from "react-icons/pi";
import { RiLogoutCircleRLine } from "react-icons/ri";
import { BiSolidUserCircle } from "react-icons/bi";
import { MdLockReset } from "react-icons/md";
import MenuItem from "@mui/material/MenuItem";
import Menu from "@mui/material/Menu";
import Divider from "@mui/material/Divider";
import { useNavigate } from "react-router-dom";

const AdminProfileDropDown = () => {
  const [anchorEl, setAnchorEl] = useState(null);
  const navigate = useNavigate();

  // Mock user (replace with Redux/API data)
  const user = {
    name: "Admin User",
    email: "admin@example.com",
  };

  const open = Boolean(anchorEl);

  const handleOpen = (event) => setAnchorEl(event.currentTarget);
  const handleClose = () => setAnchorEl(null);

  const handleLogout = () => {
    handleClose();
    localStorage.clear();
    navigate("/");
  };

  return (
    <div>
      {/* Trigger Icon */}
      <PiUserCircleDuotone
        onClick={handleOpen}
        size={42}
        className="cursor-pointer text-[#49608c] hover:text-[#2E3A8C] transition"
      />

      {/* Dropdown Menu */}
      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "right",
        }}
        transformOrigin={{
          vertical: "top",
          horizontal: "right",
        }}
        PaperProps={{
          className: "rounded-2xl shadow-xl w-72 p-2",
        }}
      >
        {/* Profile Header */}
        <div className="px-4 py-3 flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-[#2E3A8C] flex items-center justify-center text-white text-lg font-bold">
            A
          </div>

          <div>
            <p className="text-sm font-semibold text-gray-800">
              {user.name}
            </p>
            <p className="text-xs text-gray-500">{user.email}</p>
          </div>
        </div>

        <Divider />

        {/* Profile */}
        <MenuItem
          onClick={() => {
            handleClose();
            navigate("/profile");
          }}
          className="gap-2"
        >
          <BiSolidUserCircle size={20} />
          Profile
        </MenuItem>

        {/* Forgot Password */}
        <MenuItem
          onClick={() => {
            handleClose();
            navigate("/forgot-password");
          }}
          className="gap-2"
        >
          <MdLockReset size={20} />
          Change Password
        </MenuItem>

        <Divider />

        {/* Logout */}
        <MenuItem
          onClick={handleLogout}
          className="gap-2 text-red-600 hover:text-red-700"
        >
          <RiLogoutCircleRLine size={20} />
          Logout
        </MenuItem>
      </Menu>
    </div>
  );
};

export default AdminProfileDropDown;