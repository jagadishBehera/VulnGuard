import React from "react";
import { Navigate } from "react-router-dom";
import Dashboard from "../Screens/Admin/Dashboard";
import Login from "../Screens/Auth/Login";
import SignUp from "../Screens/Auth/SignUp";
import Scan from "../Screens/Admin/Scan";
import History from "../Screens/Admin/History";
import ScanDetails from "../Screens/Admin/scanDetails";

const userRoutes = [
  { path: "/admin/dashboard", component: <Dashboard /> },

  // this route should be at the end of all other routes
  { path: "/admin/", exact: true, component: <Navigate to="/admin/dashboard" /> },
  { path: "/admin/scan", component: <Scan /> },
  { path: "/admin/history", component: <History /> },
  { path: "/admin/scan/:id", component: <ScanDetails /> },
];

const authRoutes = [
  { path: "/", component: <Login /> },
  { path: "/sign-up", component: <SignUp /> },
];

export { userRoutes, authRoutes };
