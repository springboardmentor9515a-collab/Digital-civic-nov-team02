// src/App.jsx
import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';
import Admin from './pages/Admin';
import { AuthProvider } from './context/AuthProvider';
import PrivateRoute from './components/PrivateRoute';
import RoleRoute from './components/RoleRoute';
import GlobalLoader from './components/GlobalLoader';
import CreatePetition from "./pages/CreatePetition";
import Petitions from "./pages/Petitions";
import Polls from "./pages/Polls";
import PollDetails from "./pages/PollDetails";
import Governance from "./pages/Governance";
import GovernancePetition from "./pages/GovernancePetition";
import Reports from "./pages/Reports"


export default function App() {
  return (
    <AuthProvider>
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

        <Route
          path="/admin"
          element={
            <RoleRoute role="official">
              <Admin />
            </RoleRoute>
          }
        />
        <Route
          path="/petitions"
          element={
            <PrivateRoute>
              <Petitions />
            </PrivateRoute>
          }
        />

        <Route path="/polls" element={<Polls />} />
        <Route path="/polls/:id" element={<PollDetails />} />
        <Route path="/governance" element={<Governance />} />
        <Route path="/governance/:id" element={<GovernancePetition />} />
        <Route path="/reports" element={<Reports />} />

        {/* 404 fallback: send unknown routes to home (landing) */}
        <Route path="*" element={<Landing />} />
      </Routes>
    </AuthProvider>
  );
}
