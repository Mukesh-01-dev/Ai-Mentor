import React, { useEffect } from 'react';
import { Navigate, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = () => {
  const { isAuthenticated, user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    // If logged in, profile complete, and trying to access /complete-profile,
    // bounce them back to the dashboard to avoid getting stuck
    if (isAuthenticated && user?.isProfileComplete && location.pathname === '/complete-profile') {
      navigate('/dashboard', { replace: true });
    }
  }, [isAuthenticated, user?.isProfileComplete, location.pathname, navigate]);

  // Not logged in → redirect to login
  if (!isAuthenticated) return <Navigate to="/login" replace />;

  // Logged in but profile incomplete → redirect to onboarding
  // (skip if already on /complete-profile to avoid infinite loop)
  if (
    user &&
    !user.isProfileComplete &&
    location.pathname !== '/complete-profile'
  ) {
    return <Navigate to="/complete-profile" replace />;
  }

  // If we are currently redirecting away from /complete-profile, render nothing
  if (user?.isProfileComplete && location.pathname === '/complete-profile') {
    return null;
  }

  return <Outlet />;
};

export default ProtectedRoute;