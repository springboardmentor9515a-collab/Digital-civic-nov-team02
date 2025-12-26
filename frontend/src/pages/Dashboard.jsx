import React, { useState } from "react";
import { useAuth } from "../context/AuthProvider";
import Topbar from "../components/Topbar";
import Sidebar from "../components/Sidebar";
import StatCard from "../components/StatCard";
import FilterChips from "../components/FilterChips";
import PetitionsEmpty from "../components/PetitionsEmpty";
import CreatePetitionModal from "../pages/CreatePetition"; // ✅ FIX
import "../styles/dashboard.css";

export default function Dashboard() {
  const { user } = useAuth();
  const [showCreate, setShowCreate] = useState(false);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) return "GOOD MORNING";
    if (hour >= 12 && hour < 17) return "GOOD AFTERNOON";
    if (hour >= 17 && hour < 21) return "GOOD EVENING";
    return "GOOD NIGHT";
  };

  const stats = [
    { title: "My Petitions", value: 0, subtitle: "petitions", type: "blue" },
    {
      title: "Successful Petitions",
      value: 0,
      subtitle: "or under review",
      type: "green",
    },
    { title: "Polls Created", value: 0, subtitle: "polls", type: "purple" },
  ];

  return (
    <div className="app-layout">
      <Sidebar />

      <div className="app-main">
        <Topbar />

        <main className="app-content">
          <div className="db-hero">
            <div className="db-welcome">
              <div>
                <span className="db-greeting">✨ {getGreeting()}</span>
                <h2>Welcome back, {user?.name || "User"}!</h2>
                <p>
                  See what's happening in your community and make your voice heard.
                </p>
              </div>

              <button
                className="db-primary-btn"
                onClick={() => setShowCreate(true)}
              >
                Create Petition
              </button>
            </div>
          </div>

          <div className="db-stats-row">
            {stats.map((s, idx) => (
              <StatCard key={idx} {...s} />
            ))}
          </div>

          <section className="db-section">
            <div className="db-section-head">
              <h3>Active Petitions Near You</h3>
              <div className="db-location">
                <span>📍</span>
                {user?.location || "Your Location"}
              </div>
            </div>

            <FilterChips />
            <PetitionsEmpty />
          </section>
        </main>
      </div>

      {/* ✅ MODAL */}
      {showCreate && (
        <CreatePetitionModal onClose={() => setShowCreate(false)} />
      )}
    </div>
  );
}
