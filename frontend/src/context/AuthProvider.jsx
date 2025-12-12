// src/context/AuthProvider.jsx
import React, { createContext, useContext, useEffect, useState } from 'react';
import { loginApi, registerApi, meApi, logoutApi } from '../api/auth';
import http from '../api/http';
import { useNavigate } from 'react-router-dom';

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}


export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);  // { name, role, email, id } or null
  const [loading, setLoading] = useState(true); // initial loading while checking session
  const [authLoading, setAuthLoading] = useState(false); // for login/register calls
  const [error, setError] = useState(null);

  const navigate = useNavigate();

  useEffect(() => {
    // Try to restore session
    async function init() {
      setLoading(true);
      setError(null);
      try {
        // First, try GET /auth/me (works if backend sets HttpOnly cookie)
        const data = await meApi();
        // backend should return { user }
        if (data?.user) {
          setUser(data.user);
        } else if (data?.token && data?.user) {
          // If backend returns token & user (no cookie), save token in localStorage (fallback)
          localStorage.setItem('token', data.token);
          http.defaults.headers.common['Authorization'] = `Bearer ${data.token}`;
          setUser(data.user);
        } else {
          setUser(null);
        }
      } catch (err) {
        // no active session
        setUser(null);
      } finally {
        setLoading(false);
      }
    }
    init();
  }, []);

  async function login(payload) {
    setAuthLoading(true);
    setError(null);
    try {
      const data = await loginApi(payload);
      // if backend sets HttpOnly cookie, meApi would show user on next reload.
      if (data?.user) {
        setUser(data.user);
      }
      if (data?.token) {
        // fallback: save token in localStorage and set auth header
        localStorage.setItem('token', data.token);
        http.defaults.headers.common['Authorization'] = `Bearer ${data.token}`;
        if (data.user) setUser(data.user);
      }
      setAuthLoading(false);
      return { ok: true };
    } catch (err) {
      setAuthLoading(false);
      const message = err?.response?.data?.message || err.message || 'Login failed';
      setError(message);
      return { ok: false, message };
    }
  }

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
      const message = err?.response?.data?.message || err.message || 'Registration failed';
      setError(message);
      return { ok: false, message };
    }
  }

  async function logout() {
    try {
      await logoutApi(); // backend should clear cookie if used
    } catch (e) { /* ignore */ }
    // cleanup frontend state
    setUser(null);
    localStorage.removeItem('token');
    delete http.defaults.headers.common['Authorization'];
    navigate('/login');
  }

  const value = {
    user,
    setUser,
    loading,      // boolean while checking session
    authLoading,  // boolean while login/register calls
    error,
    login,
    logout,
    register,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
