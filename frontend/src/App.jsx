// src/App.jsx
import React from "react";
import { Routes, Route } from "react-router-dom";
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Dashboard from "./pages/Dashboard";
import Admin from "./pages/Admin";
import PetitionDetailPage from "./pages/PetitionDetailPage";

import PrivateRoute from "./components/PrivateRoute";
import RoleRoute from "./components/RoleRoute";
import GlobalLoader from "./components/GlobalLoader";

export default function App() {
  return (
    <>
      <GlobalLoader />

      <Routes>
        {/* Public landing page */}
        <Route path="/" element={<Landing />} />

        {/* Auth pages */}
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />

        {/* Protected app pages */}
        <Route
          path="/dashboard"
          element={
            <PrivateRoute>
              <Dashboard />
            </PrivateRoute>
          }
        />

        {/* Petition detail page */}
        <Route
          path="/petitions/:id"
          element={
            <PrivateRoute>
              <PetitionDetailPage />
            </PrivateRoute>
          }
        />

        {/* Officials only */}
        <Route
          path="/admin"
          element={
            <RoleRoute role="official">
              <Admin />
            </RoleRoute>
          }
        />

        {/* 404 fallback */}
        <Route path="*" element={<Landing />} />
      </Routes>
    </>
  );
}
