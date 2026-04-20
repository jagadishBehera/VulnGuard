import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import api from "../../services/api";

import logo from "../../Assets/Logos/AudizoneLogo.png";
import lgnBg from "../../Assets/Login/bg.png";
import LeftSection from "../../Components/Login/LeftSection";

const Login = () => {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const res = await api.post("/auth/login", form);

      toast.success("Login successful!");

      // store token
      localStorage.setItem("token", res.data.token);

      navigate("/admin/dashboard");
    } catch (err) {
      toast.error(err.response?.data?.message || "Login failed");
    }
  };

  return (
    <div className="min-h-screen grid grid-cols-1 md:grid-cols-2">
      {/* Left Side */}
      <LeftSection logo={logo} />

      {/* Right Side */}
      <div
        className="flex justify-center items-center p-10 bg-cover bg-center"
        style={{ backgroundImage: `url(${lgnBg})` }}
      >
        <div className="bg-white rounded-xl shadow-lg p-8 w-full max-w-md">
          <h2 className="text-xl font-semibold mb-1">Welcome to our CRM</h2>
          <h3 className="text-2xl font-bold mb-4">Log In Now</h3>
          <p className="text-gray-500 mb-6">
            Enter your details to proceed further
          </p>

          <form onSubmit={handleLogin} className="space-y-4">
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              placeholder="Email"
              className="w-full px-4 py-2 border rounded-md"
            />

            <input
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              placeholder="Password"
              className="w-full px-4 py-2 border rounded-md"
            />

            <button
              type="submit"
              className="w-full bg-primary text-white py-2 rounded-md hover:bg-btnHover"
            >
              Log in
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;