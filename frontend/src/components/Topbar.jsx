// src/components/Topbar.jsx
import React from 'react';

export default function Topbar(){
  return (
    <header className="db-topbar">
      <div className="db-top-left">
        <div className="db-brand">
          <span className="db-brand-icon">🏛️</span>
          <span className="db-brand-text">Civix</span>
        </div>
      </div>

      <nav className="db-top-nav">
        <a>Home</a>
        <a>Petitions</a>
        <a>Polls</a>
        <a>Reports</a>
      </nav>

      <div className="db-top-right">
        <button className="icon-btn" aria-label="Notifications">🔔</button>
        <div className="top-avatar">S</div>
      </div>
    </header>
  );
}
