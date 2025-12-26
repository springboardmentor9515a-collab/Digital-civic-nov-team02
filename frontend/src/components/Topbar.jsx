import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthProvider";

export default function Topbar({ onMenuClick }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [query, setQuery] = useState("");
  const hasNotifications = false;

  const navItems = [
    { label: "Home", path: "/dashboard" },
    { label: "Petitions", path: "/petitions" },
    { label: "Polls", path: "/polls" },
    { label: "Reports", path: "/reports" },
  ];

  return (
    <header className="db-topbar">
      {/* LEFT */}
      <div className="db-top-left">
        <button className="menu-btn" onClick={onMenuClick}>
          ☰
        </button>

        <div className="db-search">
          <span>🔍</span>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search petitions, polls..."
          />
        </div>
      </div>

      {/* CENTER NAV */}
      <nav className="db-top-nav">
        {navItems.map((item) => (
          <button
            key={item.path}
            onClick={() => navigate(item.path)}
            className={`nav-link ${
              location.pathname.startsWith(item.path) ? "active" : ""
            }`}
          >
            {item.label}
          </button>
        ))}
      </nav>

      {/* RIGHT */}
      <div className="db-top-right">
        <button className="icon-btn">
          🔔
          {hasNotifications && <span className="notif-dot" />}
        </button>

        <div className="top-user">
          <div className="top-avatar">
            {user?.name?.charAt(0).toUpperCase()}
          </div>
          <span className="top-name">{user?.name}</span>
        </div>
      </div>
    </header>
  );
}

