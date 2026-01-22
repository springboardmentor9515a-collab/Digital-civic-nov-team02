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

  const fetchPoll = async () => {
    try {
      setLoading(true);
      setError(null);

      const res = await fetch(`/api/polls/${id}`, {
        credentials: "include",
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.message || "Failed to load poll details");
      }

      const data = await res.json();
      setPoll(data);

      // ✅ backend-based vote check (ObjectId vs string safe compare)
      const voters = Array.isArray(data.voters) ? data.voters : [];
      const voted = voters.some((v) => String(v) === String(user?.id));
      setHasVoted(voted);
    } catch (err) {
      setError(err.message || "Unable to load poll details");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPoll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, user?.id]);

  const handleVote = async () => {
    if (selectedOption === null) return;

    try {
      const res = await fetch(`/api/polls/${id}/vote`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ optionIndex: selectedOption }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.message || "Vote failed");
      }

      setHasVoted(true);
      await fetchPoll(); // ✅ refresh results
    } catch (err) {
      alert(err.message || "Unable to submit vote. Please try again.");
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
                    <span>📅 {new Date(poll.createdAt).toLocaleDateString()}</span>
                  </div>

                  {user?.role === "official" && (
                    <div className="pd-info">
                      <strong>Officials cannot vote</strong>
                      <p>Only citizens can participate in polls.</p>
                    </div>
                  )}

                  {user?.role === "citizen" && !hasVoted && poll.status === "active" && (
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
                        disabled={selectedOption === null}
                        onClick={handleVote}
                      >
                        Submit Vote
                      </button>
                    </div>
                  )}

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
