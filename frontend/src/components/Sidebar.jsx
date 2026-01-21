import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthProvider";

function NavItem({ icon, label, to, active }) {
  const navigate = useNavigate();

  return (
    <div
      className={`sb-item ${active ? "sb-item-active" : ""}`}
      onClick={() => navigate(to)}
    >
      <span className="sb-icon">{icon}</span>
      <span className="sb-label">{label}</span>
      {active && <span className="sb-arrow">›</span>}
    </div>
  );
}

export default function Sidebar() {
  const { user } = useAuth();
  const location = useLocation();
  const path = location.pathname;

  const avatarLetter = user?.name
    ? user.name.charAt(0).toUpperCase()
    : "";

  // ✅ ROLE-BASED LABEL
  const governanceLabel =
    user?.role === "official" ? "Governance" : "Officials";

  return (
    <aside className="sb-root">
      {/* BRAND */}
      <div className="sb-brand">
        <div className="sb-brand-icon">🏛️</div>
        <div className="sb-brand-text">
          Civix <span className="sb-beta">BETA</span>
        </div>
      </div>

      {/* PROFILE */}
      <div className="pc-root-sidebar">
        <div className="pc-avatar-sidebar">{avatarLetter}</div>

        <div className="pc-info">
          <div className="pc-name-sidebar">{user?.name}</div>
          <div className="pc-role-sidebar">{user?.role}</div>
          <div className="pc-loc-sidebar">{user?.location}</div>
          <div className="pc-email-sidebar">{user?.email}</div>
        </div>
      </div>

      {/* NAV */}
      <div className="sb-items">
        <NavItem
          to="/dashboard"
          label="Dashboard"
          icon="🏠"
          active={path === "/dashboard"}
        />

        <NavItem
          to="/petitions"
          label="Petitions"
          icon="📝"
          active={path.startsWith("/petitions")}
        />

        <NavItem
          to="/polls"
          label="Polls"
          icon="📊"
          active={path.startsWith("/polls")}
        />

        {/* ✅ GOVERNANCE / OFFICIALS (ROLE-BASED) */}
        <NavItem
          to="/governance"
          label={governanceLabel}
          icon="🛡️"
          active={path.startsWith("/governance")}
        />

        <NavItem
          to="/reports"
          label="Reports"
          icon="📈"
          active={path.startsWith("/reports")}
        />

        <NavItem
          to="/settings"
          label="Settings"
          icon="⚙️"
          active={path.startsWith("/settings")}
        />
      </div>

      {/* FOOTER */}
      <div className="sb-footer">❓ Help & Support</div>
    </aside>
  );
}
