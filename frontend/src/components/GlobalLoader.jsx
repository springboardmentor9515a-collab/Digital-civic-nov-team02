import React from "react";
import { useAuth } from "../context/AuthContext";
import "../styles/globalloader.css";

export default function GlobalLoader() {
  const { user } = useAuth();

  // You can return null for now (frontend-only)
  return null;
}
