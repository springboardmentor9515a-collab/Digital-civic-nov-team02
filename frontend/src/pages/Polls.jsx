import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";
import { useAuth } from "../context/AuthProvider";
import CreatePollModal from "../pages/CreatePoll";
import "../styles/polls.css";

export default function Polls() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [activeTab, setActiveTab] = useState("all");

  // location filter (manual only)
  const [locationFilter, setLocationFilter] = useState("");
  const [suggestions, setSuggestions] = useState([]);

  const [polls, setPolls] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [showCreatePoll, setShowCreatePoll] = useState(false);

  /* =======================
     FETCH POLLS FROM BACKEND
     ======================= */
  useEffect(() => {
    const fetchPolls = async () => {
      try {
        setLoading(true);
        setError(null);

        // 🔗 BACKEND API (adjust base URL if needed)
        const res = await fetch("/api/polls");

        if (!res.ok) {
          throw new Error("Failed to fetch polls");
        }

        const data = await res.json();

        // 🔧 Map backend fields → frontend expectations
        const normalized = data.map((p) => ({
          id: p.id,
          question: p.question,
          location: p.location,
          status: p.status,               // "active" | "closed"
          createdAt: p.createdAt,
          votes: p.totalVotes ?? p.votes ?? 0, // safe fallback
        }));

        setPolls(normalized);
      } catch (err) {
        console.error(err);
        setError("Unable to load polls");
      } finally {
        setLoading(false);
      }
    };

    fetchPolls();
  }, []);

  /* =======================
     LOCATION SUGGESTIONS
     ======================= */
  useEffect(() => {
    if (!locationFilter || locationFilter.length < 3) {
      setSuggestions([]);
      return;
    }

    const fetchLocations = async () => {
      try {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=${locationFilter}&limit=5`,
          {
            headers: {
              Accept: "application/json",
              "User-Agent": "CivixApp/1.0",
            },
          }
        );
        const data = await res.json();
        setSuggestions(data);
      } catch {
        setSuggestions([]);
      }
    };

    fetchLocations();
  }, [locationFilter]);

  return (
    <div className="app-layout">
      <Sidebar />

      <div className="app-main">
        <Topbar />

        <main className="app-content">
          {/* HEADER */}
          <div className="pl-header">
            <div>
              <h2>
                Polls{" "}
                {user?.role === "official" && (
                  <span className="pl-badge">Official</span>
                )}
              </h2>
              <p>Create and manage polls to gather community feedback.</p>
            </div>

            {user?.role === "official" && (
              <button
                className="pl-create-btn"
                onClick={() => setShowCreatePoll(true)}
              >
                Create Poll
              </button>
            )}
          </div>

          {/* TABS + LOCATION */}
          <div className="pl-controls">
            <div className="pl-tabs">
              {["all", "active", "closed"].map((tab) => (
                <button
                  key={tab}
                  className={`pl-tab ${activeTab === tab ? "active" : ""}`}
                  onClick={() => setActiveTab(tab)}
                >
                  {tab === "all"
                    ? "All Polls"
                    : tab.charAt(0).toUpperCase() + tab.slice(1)}
                </button>
              ))}
            </div>

            {/* LOCATION INPUT */}
            <div style={{ position: "relative" }}>
              <input
                className="pl-location"
                value={locationFilter}
                placeholder="📍 Location"
                onChange={(e) => setLocationFilter(e.target.value)}
              />

              {suggestions.length > 0 && (
                <div className="pl-suggestions">
                  {suggestions.map((s) => (
                    <div
                      key={s.place_id}
                      className="pl-suggestion"
                      onClick={() => {
                        setLocationFilter(s.display_name);
                        setSuggestions([]);
                      }}
                    >
                      {s.display_name}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* CONTENT */}
          {loading && <p className="pl-center">Loading polls...</p>}

          {!loading && error && (
            <p className="pl-center" style={{ color: "red" }}>
              {error}
            </p>
          )}

          {!loading && !error && (
            <div className="pl-grid">
              {polls
                .filter(
                  (p) =>
                    (activeTab === "all" || p.status === activeTab) &&
                    (!locationFilter ||
                      p.location
                        .toLowerCase()
                        .includes(locationFilter.toLowerCase()))
                )
                .map((poll) => (
                  <div
                    key={poll.id}
                    className="pl-card"
                    onClick={() => navigate(`/polls/${poll.id}`)}
                  >
                    <span className={`pl-status ${poll.status}`}>
                      {poll.status}
                    </span>

                    <h3>{poll.question}</h3>

                    <div className="pl-meta">
                      <span>📍 {poll.location}</span>
                      <span>👥 {poll.votes} votes</span>
                    </div>

                    <div className="pl-date">
                      Created {poll.createdAt}
                    </div>
                  </div>
                ))}
            </div>
          )}
        </main>
      </div>

      {/* CREATE POLL MODAL */}
      {showCreatePoll && (
        <CreatePollModal onClose={() => setShowCreatePoll(false)} />
      )}
    </div>
  );
}
