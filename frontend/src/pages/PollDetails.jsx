import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthProvider";
import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";
import PollResults from "../components/PollResults";
import "../styles/pollDetails.css";

export default function PollDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [poll, setPoll] = useState(null);
  const [loading, setLoading] = useState(true);
  const [hasVoted, setHasVoted] = useState(false);
  const [selectedOption, setSelectedOption] = useState(null);
  const [error, setError] = useState(null);

  /* 🔐 Unique key (fallback only) */
  const voteKey = `poll_${id}_voted_${user?.id || "guest"}`;

  /* =======================
     FETCH POLL DETAILS
     ======================= */
  useEffect(() => {
    const fetchPoll = async () => {
      try {
        setLoading(true);
        setError(null);

        const res = await fetch(`/api/polls/${id}`);
        if (!res.ok) throw new Error("Failed to load poll");

        const data = await res.json();

        setPoll(data);

        // ✅ Prefer backend truth
        if (data.hasVoted === true) {
          setHasVoted(true);
        } else if (localStorage.getItem(voteKey)) {
          // 🔁 fallback for now
          setHasVoted(true);
        }
      } catch (err) {
        console.error(err);
        setError("Unable to load poll details");
      } finally {
        setLoading(false);
      }
    };

    fetchPoll();
  }, [id, voteKey]);

  /* =======================
     HANDLE VOTE
     ======================= */
  const handleVote = async () => {
    if (!selectedOption) return;

    try {
      const res = await fetch(`/api/polls/${id}/vote`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          optionId: selectedOption,
        }),
      });

      if (!res.ok) {
        throw new Error("Vote failed");
      }

      // 🔒 Persist locally (temporary safety)
      localStorage.setItem(voteKey, selectedOption);

      setHasVoted(true);
    } catch (err) {
      console.error(err);
      alert("Unable to submit vote. Please try again.");
    }
  };

  if (loading) {
    return (
      <div className="app-layout">
        <Sidebar />
        <div className="app-main">
          <Topbar />
          <main className="app-content">
            <p className="pl-center">Loading poll...</p>
          </main>
        </div>
      </div>
    );
  }

  if (error || !poll) {
    return (
      <div className="app-layout">
        <Sidebar />
        <div className="app-main">
          <Topbar />
          <main className="app-content">
            <p className="pl-center" style={{ color: "red" }}>
              {error || "Poll not found"}
            </p>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="app-layout">
      <Sidebar />

      <div className="app-main">
        <Topbar />

        <main className="app-content">
          <div className="poll-details-page">
            <button className="pd-back" onClick={() => navigate("/polls")}>
              ← Back to Polls
            </button>

            <div className="pd-layout">
              {/* LEFT */}
              <div className="pd-left">
                <div className="pd-card">
                  <div className="pd-badges">
                    <span className="pd-status">{poll.status}</span>
                    <span className="pd-official">
                      {user?.role === "citizen" ? "Citizen" : "Official"}
                    </span>
                  </div>

                  <h2>{poll.question}</h2>

                  <div className="pd-meta">
                    <span>📍 {poll.location}</span>
                    <span>👤 {poll.createdBy}</span>
                    <span>📅 {poll.createdAt}</span>
                  </div>

                  {/* OFFICIAL VIEW */}
                  {user?.role === "official" && (
                    <div className="pd-info">
                      <strong>Officials cannot vote</strong>
                      <p>Only citizens can participate in polls.</p>
                    </div>
                  )}

                  {/* CITIZEN VOTING */}
                  {user?.role === "citizen" &&
                    !hasVoted &&
                    poll.status === "active" && (
                      <div className="pd-vote-glass">
                        <p className="pd-vote-title">Select your choice:</p>

                        <div className="pd-vote-options">
                          {poll.options.map((o) => (
                            <div
                              key={o.id}
                              className={`pd-vote-option ${
                                selectedOption === o.id ? "selected" : ""
                              }`}
                              onClick={() => setSelectedOption(o.id)}
                            >
                              <span className="pd-radio" />
                              <span className="pd-option-text">{o.text}</span>
                            </div>
                          ))}
                        </div>

                        <button
                          className="pd-submit-gradient"
                          disabled={!selectedOption}
                          onClick={handleVote}
                        >
                          Submit Vote
                        </button>
                      </div>
                    )}

                  {/* SUCCESS MESSAGE */}
                  {hasVoted && (
                    <div className="pd-success-glass">
                      <div className="pd-success-icon">✓</div>
                      <div>
                        <strong>You’ve already voted</strong>
                        <p>Thank you for participating!</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* RIGHT */}
              <div className="pd-right">
                <PollResults options={poll.options} />
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
