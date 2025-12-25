import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";
import { getPetitionsApi } from "../api/petitions";
import CreatePetitionModal from "../pages/CreatePetition";
import "../styles/petitions.css";

export default function Petitions() {
  const navigate = useNavigate();

  const [petitions, setPetitions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("all");
  const [showCreate, setShowCreate] = useState(false);

  // ✅ FIX 1: status must be EMPTY for "Status: All"
  const [filters, setFilters] = useState({
    location: "",
    category: "",
    status: "",
  });

  async function fetchPetitions() {
    setLoading(true);
    try {
      const res = await getPetitionsApi(filters);
      setPetitions(res.data || []);
    } catch {
      setPetitions([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchPetitions();
  }, [filters]);

  function handleChange(e) {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  }

  return (
    <div className="app-layout">
      <Sidebar />

      <div className="app-main">
        <Topbar />

        <main className="app-content">
          {/* HEADER */}
          <div className="pt-header">
            <div>
              <h2>Petitions</h2>
              <p>Browse, sign, and track petitions in your community.</p>
            </div>

            <button
              className="pt-create-btn"
              onClick={() => setShowCreate(true)}
            >
              Create Petition
            </button>
          </div>

          {/* CONTROLS */}
          <div className="pt-controls">
            <div className="pt-tabs">
              {["all", "my", "signed"].map((tab) => (
                <button
                  key={tab}
                  className={`pt-tab ${activeTab === tab ? "active" : ""}`}
                  onClick={() => setActiveTab(tab)}
                >
                  {tab === "all"
                    ? "All Petitions"
                    : tab === "my"
                    ? "My Petitions"
                    : "Signed by Me"}
                </button>
              ))}
            </div>

            <div className="pt-filters">
              <select name="location" onChange={handleChange}>
                <option value="">All Locations</option>
                <option value="San Diego, CA">San Diego, CA</option>
                <option value="New York, NY">New York, NY</option>
              </select>

              <select name="category" onChange={handleChange}>
                <option value="">All Categories</option>
                <option value="Environment">Environment</option>
                <option value="Infrastructure">Infrastructure</option>
                <option value="Education">Education</option>
                <option value="Public Safety">Public Safety</option>
                <option value="Transportation">Transportation</option>
                <option value="Healthcare">Healthcare</option>
                <option value="Housing">Housing</option>
              </select>
              
              <select name="status" onChange={handleChange}>
                <option value="">Status: All</option>
                <option value="active">Active</option>
                <option value="under_review">Pending</option>
                <option value="closed">Closed</option>
              </select>
            </div>
          </div>

          {/* CONTENT */}
          {loading ? (
            <p className="pt-center">Loading...</p>
          ) : petitions.length === 0 ? (
            <p className="pt-center">No petitions found</p>
          ) : (
            <div className="pt-grid">
              {petitions.map((p) => (
                <div
                  key={p._id}
                  className="pt-card"
                  onClick={() => navigate(`/petitions/${p._id}`)}
                >
                  <div className="pt-progress">
                    <span
                      style={{
                        width: `${Math.min(
                          ((p.signaturesCount || 0) / 100) * 100,
                          100
                        )}%`,
                      }}
                    />
                  </div>

                  <div className="pt-time">⏱ recently</div>

                  <h3>{p.title}</h3>

                  <p className="pt-desc">
                    {p.description?.slice(0, 90)}...
                  </p>

                  <div className="pt-footer">
                    <span className="pt-count">
                      {p.signaturesCount || 0} of 100 signatures
                    </span>

                    <span className={`pt-status ${p.status || "active"}`}>
                      {p.status || "Active"}
                    </span>
                  </div>

                  <span className="pt-link">View Details</span>
                </div>
              ))}
            </div>
          )}
        </main>
      </div>

      {/* MODAL */}
      {showCreate && (
        <CreatePetitionModal onClose={() => setShowCreate(false)} />
      )}
    </div>
  );
}
