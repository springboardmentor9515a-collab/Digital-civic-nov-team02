// src/components/RoleRoute.jsx
import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthProvider";

export default function RoleRoute({ role, children }) {
  const { user, authLoading } = useAuth();

  if (authLoading) return null;

  // If not logged in → go to login
  if (!user) return <Navigate to="/login" replace />;

  // If user role doesn't match → go to dashboard
  if (user.role !== role) return <Navigate to="/dashboard" replace />;

  return children;
}
