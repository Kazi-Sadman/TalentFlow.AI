import type { ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { homePathFor } from "../../utils/format";
import type { UserRole } from "../../types";

interface Props {
  role: UserRole;
  children: ReactNode;
}

// Only lets a logged-in user with the right role see the page
export default function ProtectedRoute({ role, children }: Props) {
  const { user } = useAuth();
  const location = useLocation();

  if (user === null) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  if (user.role !== role) {
    return <Navigate to={homePathFor(user.role)} replace />;
  }

  return <>{children}</>;
}
