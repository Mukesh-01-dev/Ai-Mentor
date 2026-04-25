import { Navigate, useLocation } from "react-router-dom";
import { getAdminSession } from "../lib/adminApi";

function ProtectedRoute({ children }) {
  const location = useLocation();
  const { token, user } = getAdminSession();

  const isAllowed = Boolean(
    token && (user?.role === "admin" || user?.role === "superAdmin")
  );

  if (!isAllowed) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  return children;
}

export default ProtectedRoute;
