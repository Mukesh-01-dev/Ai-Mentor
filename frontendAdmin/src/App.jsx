import { Navigate, Outlet, Route, Routes, useLocation } from "react-router-dom";
import AdminPage from "./pages/AdminPage";
import LoginPage from "./pages/LoginPage";

const isAdminRole = (role) => role === "admin" || role === "superAdmin";

const getStoredUser = () => {
  try {
    const raw = localStorage.getItem("user");
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

function RequireAdminAuth() {
  const token = localStorage.getItem("token");
  const user = getStoredUser();
  const location = useLocation();

  if (!token) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  if (!isAdminRole(user?.role)) {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}

function PublicOnly() {
  const token = localStorage.getItem("token");
  const user = getStoredUser();

  return (
    <Routes>
      <Route element={<PublicOnly />}>
        <Route path="/login" element={<LoginPage />} />
      </Route>

      <Route element={<RequireAdminAuth />}>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/dashboard" element={<AdminPage />} />
        <Route path="/courses" element={<AdminPage />} />
        <Route path="/users" element={<AdminPage />} />
        <Route path="/enrollments" element={<AdminPage />} />
        <Route path="/payments" element={<AdminPage />} />
        <Route path="/reports" element={<AdminPage />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
