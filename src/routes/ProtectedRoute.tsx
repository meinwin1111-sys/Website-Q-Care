import { Navigate, Outlet, useLocation } from "react-router";

import { useAuth } from "../contexts/AuthContext";

export default function ProtectedRoute({ requireAdmin = false }: { requireAdmin?: boolean }) {
  const { isLoggedIn, role } = useAuth();
  const location = useLocation();

  if (!isLoggedIn) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  if (requireAdmin && role !== "admin") {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}
