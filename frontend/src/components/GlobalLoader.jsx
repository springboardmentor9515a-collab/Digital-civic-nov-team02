// src/components/GlobalLoader.jsx
import React from "react";
import { useAuth } from "../context/AuthProvider";
import "../styles/globalloader.css";

export default function GlobalLoader() {
  const { authLoading } = useAuth();

  if (!authLoading) return null;

  return (
    <div className="gl-overlay">
      <div className="gl-spinner"></div>
    </div>
  );
}
