import React, { useState } from "react";
import { useParams } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";
import { useAuth } from "../context/AuthProvider";
import "../styles/pollDetail.css";

export default function PollDetail() {
  const { id } = useParams();
  const { user } = useAuth();

  const [selected, setSelected] = useState(null);
  const [hasVoted, setHasVoted] = useState(false);

  const options = [
    "Yes, absolutely",
    "No, current routes are enough",
    "Need more study",
  ];

  function handleVote() {
    if (selected === null) return;
    setHasVoted(true);
  }

  return (
    <div className="app-layout">
      <Sidebar />

      <div className="app-main">
        <Topbar />

        <main className="app-content pd-root">
          <div className="pd-card">
            <span className="pd-location">📍 Mumbai</span>

            <h1 className="pd-question">
              Should we implement a new public transport route?
            </h1>

            <p className="pd-desc">
              This poll is intended to gather public opinion on introducing
              additional public transport routes to reduce traffic congestion.
            </p>

            <div className="pd-options">
              {options.map((opt, i) => (
                <label
                  key={i}
                  className={`pd-option ${selected === i ? "selected" : ""}`}
                >
                  <input
                    type="radio"
                    name="poll"
                    disabled={hasVoted || user?.role !== "citizen"}
                    checked={selected === i}
                    onChange={() => setSelected(i)}
                  />
                  {opt}
                </label>
              ))}
            </div>

            {/* VOTE BUTTON */}
            {user?.role === "citizen" && !hasVoted && (
              <button
                className="pd-vote-btn"
                disabled={selected === null}
                onClick={handleVote}
              >
                Submit Vote
              </button>
            )}

            {/* AFTER VOTE */}
            {hasVoted && (
              <p className="pd-success">
                ✅ Thank you! Your vote has been recorded.
              </p>
            )}

            {/* OFFICIAL INFO */}
            {user?.role !== "citizen" && (
              <p className="pd-info">
                ℹ️ Only citizens are allowed to vote in polls.
              </p>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
