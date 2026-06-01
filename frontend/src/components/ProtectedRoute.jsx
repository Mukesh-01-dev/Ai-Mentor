import React, { useEffect } from "react";
import { Navigate, Outlet, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const ProtectedRoute = () => {
  const { isAuthenticated, user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    if (
      isAuthenticated &&
      user?.isProfileComplete &&
      location.pathname === "/complete-profile"
    ) {
      navigate("/dashboard", { replace: true });
    }
  }, [isAuthenticated, user?.isProfileComplete, location.pathname, navigate]);

  // ❌ Not logged in
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // ❌ Profile not complete
  if (user && !user.isProfileComplete) {
    if (location.pathname !== "/complete-profile") {
      return <Navigate to="/complete-profile" replace />;
    }
  }

  // ✔ allow access
  return <Outlet />;
};

export default ProtectedRoute;
