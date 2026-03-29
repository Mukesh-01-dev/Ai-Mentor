import AdminPage from "./pages/AdminPage";
import LoginPage from "./pages/LoginPage";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";

function getAuthUser() {
  try {
    const token = localStorage.getItem("token");
    const rawUser = localStorage.getItem("user");
    const user = rawUser ? JSON.parse(rawUser) : null;
    return { token, user };
  } catch {
    return { token: null, user: null };
  }
}

function RequireAdmin({ children }) {
  const { token, user } = getAuthUser();
  if (!token || user?.role !== "admin") {
    return <Navigate to="/login" replace />;
  }
  return children;
}

function LoginRoute() {
  const { token, user } = getAuthUser();
  if (token && user?.role === "admin") {
    return <Navigate to="/dashboard" replace />;
  }
  return <LoginPage />;
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/login" element={<LoginRoute />} />
        <Route
          path="/dashboard"
          element={
            <RequireAdmin>
              <AdminPage />
            </RequireAdmin>
          }
        />
        <Route
          path="/courses"
          element={
            <RequireAdmin>
              <AdminPage />
            </RequireAdmin>
          }
        />
        <Route
          path="/users"
          element={
            <RequireAdmin>
              <AdminPage />
            </RequireAdmin>
          }
        />
        <Route
          path="/enrollments"
          element={
            <RequireAdmin>
              <AdminPage />
            </RequireAdmin>
          }
        />
        <Route
          path="/payments"
          element={
            <RequireAdmin>
              <AdminPage />
            </RequireAdmin>
          }
        />
        <Route
          path="/reports"
          element={
            <RequireAdmin>
              <AdminPage />
            </RequireAdmin>
          }
        />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
