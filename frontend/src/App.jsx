import React, { Suspense, lazy } from "react";
import { Routes, Route, Navigate, Outlet } from "react-router-dom";
import { useAuth } from "./context/AuthContext";

import ProtectedRoute from "./components/ProtectedRoute";
import AdminRoute from "./components/AdminRoute";
import DashboardLayout from "./components/DashboardLayout";
import LoadingSpinner from "./components/common/LoadingSpinner";

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
const ReportPage = lazy(() => import("./pages/ReportPage"));
const Success = lazy(() => import("./pages/Success"));
const NotFound = lazy(() => import("./pages/NotFound"));
const DocumentationPage = lazy(() =>
  import("./pages/Documentation/DocumentationPage")
);

import CompleteProfilePage from "./pages/CompleteProfilePage";
import "./App.css";

// Redirect from root
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

// Public routes (block logged-in users)
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

const App = () => {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <Routes>

        {/* ROOT */}
        <Route path="/" element={<RootRedirect />} />

        {/* PUBLIC ROUTES */}
        <Route element={<PublicRoutes />}>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignUpPage />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password/:token" element={<ResetPassword />} />
        </Route>

        {/* PUBLIC DOCUMENTATION */}
        <Route path="/documentation" element={<DocumentationPage />} />

        {/* =========================
            PROTECTED ROUTES (USER)
        ========================= */}
        <Route element={<ProtectedRoute />}>
          <Route path="/complete-profile" element={<CompleteProfilePage />} />

          <Route element={<DashboardLayout />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/analytics" element={<Analytics />} />
            <Route path="/courses" element={<CoursesPage />} />
            <Route path="/discussions" element={<DiscussionsPage />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/certificates" element={<CertificatesPage />} />
            <Route path="/report" element={<ReportPage />} />
            <Route path="/watchedvideos" element={<WatchedVideos />} />
            <Route path="/learning/:id" element={<LearningPage />} />
            <Route path="/success" element={<Success />} />
          </Route>

          <Route
            path="/course-preview/:courseId"
            element={<CoursePreview />}
          />

          {/* =========================
              ADMIN ROUTES (RBAC FIX)
          ========================= */}
          <Route element={<AdminRoute />}>
            <Route path="/admin" element={<div>Admin Dashboard</div>} />
            <Route path="/admin/users" element={<div>Manage Users</div>} />
            <Route path="/admin/courses" element={<div>Manage Courses</div>} />
          </Route>
        </Route>

        {/* 404 */}
        <Route path="*" element={<NotFound />} />

      </Routes>
    </Suspense>
  );
};

export default App;