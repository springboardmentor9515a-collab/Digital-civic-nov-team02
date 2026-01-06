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

  // ✅ location search + suggestions
  const [locationFilter, setLocationFilter] = useState("");
  const [suggestions, setSuggestions] = useState([]);

  const [polls, setPolls] = useState([]);
  const [loading, setLoading] = useState(true);

  // ✅ create poll modal
  const [showCreatePoll, setShowCreatePoll] = useState(false);

  // ✅ set default location AFTER user loads
  useEffect(() => {
    if (user?.location) {
      setLocationFilter(user.location);
    }
  }, [user]);

  // TEMP: mock loading
  useEffect(() => {
    setTimeout(() => {
      setPolls([
        {
          id: 1,
          question: "Should we implement a new public transport route?",
          location: "Mumbai",
          votes: 279,
          status: "active",
          createdAt: "2024-01-15",
        },
        {
          id: 2,
          question: "Which park renovation should be prioritized?",
          location: "Delhi",
          votes: 635,
          status: "active",
          createdAt: "2024-01-12",
        },
        {
          id: 3,
          question: "Preferred timing for community meetings?",
          location: "Bangalore",
          votes: 235,
          status: "closed",
          createdAt: "2024-01-10",
        },
      ]);
      setLoading(false);
    }, 600);
  }, []);

  // 🔍 Fetch location suggestions
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

          {/* TABS + LOCATION SEARCH */}
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
          {loading ? (
            <p className="pl-center">Loading polls...</p>
          ) : (
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