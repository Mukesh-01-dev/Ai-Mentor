import React, { useEffect } from 'react';
import { Navigate, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = () => {
  const { isAuthenticated, user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    // If user somehow lands on complete-profile even after completing it
    if (
      isAuthenticated &&
      user?.isProfileComplete &&
      location.pathname === '/complete-profile'
    ) {
      navigate('/dashboard'); // safer than navigate(-1)
    }
  }, [isAuthenticated, user?.isProfileComplete, location.pathname, navigate]);

  // ❌ Not logged in → go to login
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // ✅ Logged in → allow access everywhere (including dashboard)
  return <Outlet />;
};

export default ProtectedRoute;