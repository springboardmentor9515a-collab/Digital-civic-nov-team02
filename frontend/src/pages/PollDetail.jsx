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

  // ✅ STEP 5: official response states
  const [responseText, setResponseText] = useState("");
  const [petitionStatus, setPetitionStatus] = useState("under_review");
  const [submitted, setSubmitted] = useState(false);

  // ✅ STEP 6: temporary official response (public view)
  const officialResponse = {
    text: "The transport department has reviewed this petition. A feasibility study will be conducted before taking a final decision.",
    status: "under_review",
    timestamp: new Date().toLocaleString(),
  };

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

            {/* POLL OPTIONS */}
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

            {/* ✅ STEP 5: OFFICIAL RESPONSE SECTION */}
            {user?.role === "official" && (
              <div className="pd-response">
                <h3>Official Response</h3>

                <textarea
                  placeholder="Write your official response here..."
                  value={responseText}
                  onChange={(e) => setResponseText(e.target.value)}
                />

                <select
                  value={petitionStatus}
                  onChange={(e) => setPetitionStatus(e.target.value)}
                >
                  <option value="under_review">Under Review</option>
                  <option value="closed">Closed</option>
                </select>

                <button
                  className="pd-vote-btn"
                  onClick={() => setSubmitted(true)}
                  disabled={!responseText}
                >
                  Submit Response
                </button>

                {submitted && (
                  <p className="pd-success">
                    ✅ Response submitted successfully
                  </p>
                )}
              </div>
            )}

            {/* ✅ STEP 6: PUBLIC TRANSPARENCY VIEW (READ-ONLY) */}
            {user?.role === "citizen" && officialResponse && (
              <div className="pd-response public">
                <h3>Official Update</h3>

                <p>
                  <b>Status:</b> {officialResponse.status}
                </p>

                <p>{officialResponse.text}</p>

                <small>🕒 Updated on: {officialResponse.timestamp}</small>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
