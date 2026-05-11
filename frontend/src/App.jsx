import React, { Suspense, lazy } from "react";
import { Routes, Route, Navigate, Outlet } from "react-router-dom";
import { useAuth } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import DashboardLayout from "./components/DashboardLayout";
import LoadingSpinner from "./components/common/LoadingSpinner";
import CompleteProfilePage from "./pages/CompleteProfilePage";
import "./App.css";

// Lazy Loading
const LoginPage = lazy(() => import("./pages/LoginPage"));
const SignUpPage = lazy(() => import("./pages/SignUpPage"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const Analytics = lazy(() => import("./pages/Analytics"));
const CoursesPage = lazy(() => import("./pages/CoursesPage"));
const DiscussionsPage = lazy(() => import("./pages/DiscussionsPage"));
const Settings = lazy(() => import("./pages/Settings"));
const WatchedVideos = lazy(() => import("./pages/WatchedVideos"));
const CoursePreview = lazy(() => import("./pages/CoursePreview"));
const LearningPage = lazy(() => import("./pages/LearningPage"));
const ForgotPassword = lazy(() => import("./pages/ForgotPassword"));
const ResetPassword = lazy(() => import("./pages/ResetPassword"));
const CertificatesPage = lazy(() => import("./pages/CertificatesPage"));
const Success = lazy(() => import("./pages/Success"));

/* =========================
   REDIRECT LOGIC
========================= */

const RootRedirect = () => {
  const { isAuthenticated, user } = useAuth();

  if (!isAuthenticated) return <Navigate to="/login" replace />;

  return (
    <Navigate
      to={user?.isProfileComplete ? "/dashboard" : "/complete-profile"}
      replace
    />
  );
};

const PublicRoutes = () => {
  const { isAuthenticated, user } = useAuth();

  if (!isAuthenticated) return <Outlet />;

  return (
    <Navigate
      to={user?.isProfileComplete ? "/dashboard" : "/complete-profile"}
      replace
    />
  );
};

/* =========================
   MAIN APP
========================= */

const App = () => {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <Routes>

        {/* Root Redirect */}
        <Route path="/" element={<RootRedirect />} />

        {/* Public Routes */}
        <Route element={<PublicRoutes />}>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignUpPage />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password/:token" element={<ResetPassword />} />
        </Route>

        {/* Protected Routes */}
        <Route element={<ProtectedRoute />}>

          {/* Profile Completion */}
          <Route path="/complete-profile" element={<CompleteProfilePage />} />

          {/* Dashboard Layout */}
          <Route element={<DashboardLayout />}>

            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/analytics" element={<Analytics />} />
            <Route path="/courses" element={<CoursesPage />} />
            <Route path="/discussions" element={<DiscussionsPage />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/certificates" element={<CertificatesPage />} />

            {/* ✅ FIXED ROUTE (IMPORTANT) */}
            <Route path="/watched" element={<WatchedVideos />} />

            <Route path="/learning/:id" element={<LearningPage />} />
            <Route path="/success" element={<Success />} />

          </Route>
        </Route>

        {/* Public Course Preview */}
        <Route path="/course-preview/:courseId" element={<CoursePreview />} />

        {/* ✅ FALLBACK ROUTE */}
        <Route path="*" element={<Navigate to="/" replace />} />

      </Routes>
    </Suspense>
  );
};

export default App;