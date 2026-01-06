import React, { createContext, useContext, useEffect, useState } from 'react';
import { loginApi, registerApi, meApi, logoutApi } from '../api/auth';
import http from '../api/http';
import { useNavigate } from 'react-router-dom';

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {

  /* ===============================
     🔴 DEV ONLY MOCK USER (TEMP)
     Change role to "official" if needed
     =============================== */
  const [user, setUser] = useState({
    role: "citizen",     // change to "official" to test Create Poll
    location: "Mumbai",
    name: "Test User",
  });

  // ⛔ Original (keep commented for later backend use)
  // const [user, setUser] = useState(null);

  const [loading, setLoading] = useState(false); // disable initial auth check
  const [authLoading, setAuthLoading] = useState(false);
  const [error, setError] = useState(null);

  const navigate = useNavigate();

  /* ===============================
     ❌ DISABLED AUTO SESSION CHECK
     (Backend not running)
     =============================== */
  /*
  useEffect(() => {
    async function init() {
      setLoading(true);
      setError(null);
      try {
        const data = await meApi();
        if (data?.user) {
          setUser(data.user);
        } else if (data?.token && data?.user) {
          localStorage.setItem('token', data.token);
          http.defaults.headers.common['Authorization'] = `Bearer ${data.token}`;
          setUser(data.user);
        } else {
          setUser(null);
        }
      } catch (err) {
        setUser(null);
      } finally {
        setLoading(false);
      }
    }
    init();
  }, []);
  */

  /* ===============================
     LOGIN (will work when backend added)
     =============================== */
  async function login(payload) {
    setAuthLoading(true);
    setError(null);
    try {
      const data = await loginApi(payload);
      if (data?.user) {
        setUser(data.user);
      }
      if (data?.token) {
        localStorage.setItem('token', data.token);
        http.defaults.headers.common['Authorization'] = `Bearer ${data.token}`;
        if (data.user) setUser(data.user);
      }
      setAuthLoading(false);
      return { ok: true };
    } catch (err) {
      setAuthLoading(false);
      const message =
        err?.response?.data?.message || err.message || 'Login failed';
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
      if (data?.user) setUser(data.user);
      if (data?.token) {
        localStorage.setItem('token', data.token);
        http.defaults.headers.common['Authorization'] = `Bearer ${data.token}`;
      }
      setAuthLoading(false);
      return { ok: true };
    } catch (err) {
      setAuthLoading(false);
      const message =
        err?.response?.data?.message || err.message || 'Registration failed';
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
    } catch (e) { /* ignore */ }

    setUser(null);
    localStorage.removeItem('token');
    delete http.defaults.headers.common['Authorization'];
    navigate('/login');
  }

  const value = {
    user,
    setUser,
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
