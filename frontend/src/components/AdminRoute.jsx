import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const AdminRoute = () => {
  const { isAuthenticated, user } = useAuth();

  console.log("AdminRoute User:", user);

  // Not logged in
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Wait until user loads
  if (!user) {
    return <div>Loading...</div>;
  }

  // Allow only admin & superadmin
  const allowedRoles = ["admin", "superadmin"];

  if (!allowedRoles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
};

export default AdminRoute;