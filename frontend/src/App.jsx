import React from "react";
import { Routes, Route, Navigate, Outlet } from "react-router-dom";
import { useAuth } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import AdminRoute from "./components/AdminRoute";
import LoginPage from "./pages/LoginPage";
import SignUpPage from "./pages/SignUpPage";
import ForgotPassword from "./pages/ForgotPassword";
import Dashboard from "./pages/Dashboard";
import Analytics from "./pages/Analytics";
import CoursesPage from "./pages/CoursesPage";
import DiscussionsPage from "./pages/DiscussionsPage";
import Settings from "./pages/Settings";
import WatchedVideos from "./pages/WatchedVideos";
import CoursePreview from "./pages/CoursePreview";
import LearningPage from "./pages/LearningPage";
import AdminPage from "./pages/AdminPage";
import "./App.css";

// Redirects from the root path based on authentication status.
const RootRedirect = () => {
  const { isAuthenticated } = useAuth();
  return <Navigate to={isAuthenticated ? "/dashboard" : "/login"} replace />;
};

const PublicRoutes = () => {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? <Navigate to="/dashboard" replace /> : <Outlet />;
};

const App = () => {
  const { loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-canvas-alt flex items-center justify-center">
        <div className="text-center animate-pulse">
          <div className="w-12 h-12 border-4 border-teal-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-sm font-black text-main uppercase tracking-widest">Initialising...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="antialiased text-main bg-canvas-alt min-h-screen selection:bg-teal-500/30 selection:text-teal-900">
      <Routes>
        {/* Redirect from root */}
        <Route path="/" element={<RootRedirect />} />

        {/* Public routes that logged-in users should not see */}
        <Route element={<PublicRoutes />}>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignUpPage />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
        </Route>

        {/* Protected Routes */}
        <Route element={<ProtectedRoute />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/analytics" element={<Analytics />} />
          <Route path="/courses" element={<CoursesPage />} />
          <Route path="/discussions" element={<DiscussionsPage />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/watchedvideos" element={<WatchedVideos />} />
          <Route path="/learning/:id" element={<LearningPage />} />
        </Route>

        {/* Admin Routes */}
        <Route element={<AdminRoute />}>
          <Route path="/admin" element={<AdminPage />} />
        </Route>

        {/* Other public routes */}
        <Route path="/course-preview/:courseId" element={<CoursePreview />} />
      </Routes>
    </div>
  );
};

export default App;
