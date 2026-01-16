import React, { createContext, useContext, useState } from "react";
import { loginApi, registerApi, meApi, logoutApi } from "../api/auth";
import http from "../api/http";
import { useNavigate } from "react-router-dom";

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {

  /* ===============================
     🔴 DEV ONLY MOCK USER (TEMP)
     Change role to "official" or "citizen" to test UI
     =============================== */
  const [user, setUser] = useState({
    role: "citizen",   // "citizen" | "official"
    location: "Mumbai",
    name: "Test User",
  });

  // ⛔ Use this when backend is ready
  // const [user, setUser] = useState(null);

  const [loading, setLoading] = useState(false);
  const [authLoading, setAuthLoading] = useState(false);
  const [error, setError] = useState(null);

  const navigate = useNavigate();

  /* ===============================
     ROLE HELPERS (VERY IMPORTANT)
     =============================== */
  const isCitizen = user?.role === "citizen";
  const isOfficial = user?.role === "official";

  /* ===============================
     LOGIN (future backend)
     =============================== */
  async function login(payload) {
    setAuthLoading(true);
    setError(null);
    try {
      const data = await loginApi(payload);

      if (data?.token) {
        localStorage.setItem("token", data.token);
        http.defaults.headers.common["Authorization"] = `Bearer ${data.token}`;
      }

      if (data?.user) {
        setUser(data.user);
      }

      setAuthLoading(false);
      return { ok: true };
    } catch (err) {
      setAuthLoading(false);
      const message =
        err?.response?.data?.message || err.message || "Login failed";
      setError(message);
      return { ok: false, message };
    }
  }

  /* ===============================
     REGISTER (future backend)
     =============================== */
  async function register(payload) {
    setAuthLoading(true);
    setError(null);
    try {
      const data = await registerApi(payload);

      if (data?.token) {
        localStorage.setItem("token", data.token);
        http.defaults.headers.common["Authorization"] = `Bearer ${data.token}`;
      }

      if (data?.user) {
        setUser(data.user);
      }

      setAuthLoading(false);
      return { ok: true };
    } catch (err) {
      setAuthLoading(false);
      const message =
        err?.response?.data?.message || err.message || "Registration failed";
      setError(message);
      return { ok: false, message };
    }
  }

  /* ===============================
     LOGOUT
     =============================== */
  async function logout() {
    try {
      await logoutApi();
    } catch (e) {
      /* ignore */
    }

    setUser(null);
    localStorage.removeItem("token");
    delete http.defaults.headers.common["Authorization"];
    navigate("/login");
  }

  const value = {
    user,
    setUser,
    isCitizen,   // ✅ use everywhere
    isOfficial,  // ✅ use everywhere
    loading,
    authLoading,
    error,
    login,
    logout,
    register,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}
