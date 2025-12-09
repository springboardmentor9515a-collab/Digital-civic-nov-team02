// src/pages/Dashboard.jsx
import React from 'react';
import Topbar from '../components/Topbar';
import Sidebar from '../components/Sidebar';
import StatCard from '../components/StatCard';
import FilterChips from '../components/FilterChips';
import PetitionsEmpty from '../components/PetitionsEmpty';
import '../styles/dashboard.css';

export default function Dashboard() {
  // placeholder counts (replace when wired to API)
  const stats = [
    { title: 'My Petitions', value: 0, subtitle: 'petitions' },
    { title: 'Successful Petitions', value: 0, subtitle: 'or under review' },
    { title: 'Polls Created', value: 0, subtitle: 'polls' }
  ];

  return (
    <div className="db-root">
      <Topbar />
      <div className="db-body">
        <aside className="db-sidebar">
          <Sidebar />
        </aside>

        <main className="db-main">
          <div className="db-hero">
            {/* Removed spacer so welcome aligns to the left of main content */}
            <div className="db-welcome">
              <h2>Welcome back!</h2>
              <p>See what's happening in your community and make your voice heard.</p>
            </div>
          </div>

          <div className="db-stats-row">
            {stats.map((s, idx) => <StatCard key={idx} {...s} />)}
          </div>

          <section className="db-section">
            <div className="db-section-head">
              <h3>Active Petitions Near You</h3>
              <div className="db-location-select">
                <label>Showing for:</label>
                <button className="location-btn">San Diego, CA ▾</button>
              </div>
            </div>

            <FilterChips />
            <PetitionsEmpty />
          </section>
        </main>
      </div>
    </div>
  );
}
