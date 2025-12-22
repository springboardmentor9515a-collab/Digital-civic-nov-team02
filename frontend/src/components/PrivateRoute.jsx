import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function PrivateRoute({ children }) {
  const { user } = useAuth();

  // since this is frontend-only, allow access if user exists
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return children;
}
