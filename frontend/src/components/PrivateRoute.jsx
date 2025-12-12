// src/components/PrivateRoute.jsx
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthProvider';

export default function PrivateRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) {
    // optionally show nothing or a loader until session is resolved
    return null;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return children;
}
