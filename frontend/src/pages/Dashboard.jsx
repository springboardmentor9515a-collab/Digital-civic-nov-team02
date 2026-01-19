import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthProvider";
import http from "../api/http"; // ✅ FIXED IMPORT
import Topbar from "../components/Topbar";
import Sidebar from "../components/Sidebar";
import StatCard from "../components/StatCard";
import PetitionsEmpty from "../components/PetitionsEmpty";
import CreatePetitionModal from "../pages/CreatePetition";
import "../styles/dashboard.css";

/* ===========================
   PETITION CARD COMPONENT
=========================== */
const DashboardPetitionCard = ({ petition }) => {
  const signedCount = petition.signers?.length || 0;

  return (
    <div
      style={{
        background: "white",
        border: "1px solid #e5e7eb",
        borderRadius: "12px",
        padding: "20px",
        display: "flex",
        flexDirection: "column",
        gap: "12px",
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <span
          style={{
            fontSize: "12px",
            fontWeight: "600",
            color: "#4F46E5",
            background: "#EEF2FF",
            padding: "4px 12px",
            borderRadius: "20px",
          }}
        >
          {petition.category}
        </span>

        <span style={{ fontSize: "12px", color: "green" }}>
          ● {petition.status}
        </span>
      </div>

      <h3>{petition.title}</h3>

      <p style={{ color: "#6B7280", fontSize: "14px" }}>
        {petition.description.length > 80
          ? petition.description.slice(0, 80) + "..."
          : petition.description}
      </p>

      <div style={{ fontSize: "13px", color: "#6B7280" }}>
        📍 {petition.location}
      </div>

      <div style={{ marginTop: "auto" }}>
        <strong>{signedCount} signed</strong> of {petition.goal}
        <div
          style={{
            width: "100%",
            height: "6px",
            background: "#E5E7EB",
            borderRadius: "10px",
            marginTop: "6px",
          }}
        >
          <div
            style={{
              width: `${Math.min((signedCount / petition.goal) * 100, 100)}%`,
              height: "100%",
              background: "#4F46E5",
            }}
          />
        </div>
      </div>
    </div>
  );
};

/* ===========================
   DASHBOARD PAGE
=========================== */
export default function Dashboard() {
  const { user, loading } = useAuth(); // ✅ FIX: include loading
  const [showCreate, setShowCreate] = useState(false);
  const [petitions, setPetitions] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("All");

  /* 🔒 AUTH SAFETY (CRITICAL FIX) */
  if (loading) {
    return <div style={{ padding: "40px" }}>Loading dashboard...</div>;
  }

  if (!user) {
    return <div style={{ padding: "40px" }}>Please login again</div>;
  }

  /* 📥 FETCH PETITIONS */
  useEffect(() => {
    const fetchPetitions = async () => {
      try {
        const res = await http.get("/petitions"); // ✅ FIXED API CALL
        setPetitions(res.data);
      } catch (err) {
        console.error("Failed to load petitions", err);
      }
    };
    fetchPetitions();
  }, []);

  /* 🔍 FILTER */
  const filteredPetitions = petitions.filter((p) =>
    selectedCategory === "All" ? true : p.category === selectedCategory
  );

  const stats = [
    {
      title: "My Petitions",
      value: petitions.filter((p) => p.creator?._id === user._id).length,
      subtitle: "active",
      type: "blue",
    },
    {
      title: "Total Active",
      value: petitions.length,
      subtitle: "community",
      type: "green",
    },
    {
      title: "Polls Created",
      value: 0,
      subtitle: "polls",
      type: "purple",
    },
  ];

  const categories = [
    "All",
    "Infrastructure",
    "Education",
    "Public Safety",
    "Environment",
    "Transportation",
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
                <span className="db-greeting">✨ Welcome back</span>
                <h2>{user.name}</h2>
                <p>See what's happening in your community</p>
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
            {stats.map((s, i) => (
              <StatCard key={i} {...s} />
            ))}
          </div>

          <section className="db-section">
            <h3>Active Petitions</h3>

            <div style={{ display: "flex", gap: "10px", marginBottom: "20px" }}>
              {categories.map((c) => (
                <button
                  key={c}
                  onClick={() => setSelectedCategory(c)}
                  style={{
                    padding: "6px 14px",
                    borderRadius: "20px",
                    border: "none",
                    background:
                      selectedCategory === c ? "#4F46E5" : "#E5E7EB",
                    color: selectedCategory === c ? "white" : "#374151",
                  }}
                >
                  {c}
                </button>
              ))}
            </div>

            {filteredPetitions.length > 0 ? (
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns:
                    "repeat(auto-fill, minmax(300px, 1fr))",
                  gap: "20px",
                }}
              >
                {filteredPetitions.map((p) => (
                  <DashboardPetitionCard key={p._id} petition={p} />
                ))}
              </div>
            ) : (
              <PetitionsEmpty />
            )}
          </section>
        </main>
      </div>

      {showCreate && (
        <CreatePetitionModal onClose={() => setShowCreate(false)} />
      )}
    </div>
  );
}
