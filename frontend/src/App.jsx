import React from "react";
import { Routes, Route, Navigate, Outlet } from "react-router-dom";
import { useAuth } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import AdminRoute from "./components/AdminRoute";
import LoginPage from "./pages/LoginPage";
import SignUpPage from "./pages/SignUpPage";
import Dashboard from "./pages/Dashboard";
import Analytics from "./pages/Analytics";
import CoursesPage from "./pages/CoursesPage";
import DiscussionsPage from "./pages/DiscussionsPage";
import Settings from "./pages/Settings";
import WatchedVideos from "./pages/WatchedVideos";
import CoursePreview from "./pages/CoursePreview";
import LearningPage from "./pages/LearningPage";
import AdminPage from "./pages/AdminPage";
import { ThemeProvider } from "./context/ThemeContext";
import "./App.css";

const RootRedirect = () => {
  const { isAuthenticated } = useAuth();
  return <Navigate to={isAuthenticated ? "/dashboard" : "/login"} replace />;
};

const PublicRoutes = () => {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? <Navigate to="/dashboard" replace /> : <Outlet />;
};

const App = () => {
  return (
    <ThemeProvider>
      {/* Wrap whole app in ThemeProvider */}
      <div className="min-h-screen bg-white dark:bg-slate-900 text-black dark:text-white">
        <Routes>
          <Route path="/" element={<RootRedirect />} />

          <Route element={<PublicRoutes />}>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignUpPage />} />
          </Route>

          <Route element={<ProtectedRoute />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/analytics" element={<Analytics />} />
            <Route path="/courses" element={<CoursesPage />} />
            <Route path="/discussions" element={<DiscussionsPage />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/watchedvideos" element={<WatchedVideos />} />
            <Route path="/learning/:id" element={<LearningPage />} />
          </Route>

          <Route element={<AdminRoute />}>
            <Route path="/admin" element={<AdminPage />} />
          </Route>

          <Route path="/course-preview/:courseId" element={<CoursePreview />} />
        </Routes>
      </div>
    </ThemeProvider>
  );
};

export default App;
