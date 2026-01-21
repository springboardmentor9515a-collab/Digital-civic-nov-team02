import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";
import { useAuth } from "../context/AuthProvider";
import "../styles/governancePetition.css";

/* TIME HELPER */
function timeAgo(date) {
  if (!date) return "-";

  const diffMs = Date.now() - new Date(date).getTime();
  const diffMins = Math.floor(diffMs / 60000);

  if (diffMins < 1) return "less than a minute ago";
  if (diffMins < 60) return `${diffMins} minutes ago`;

  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24)
    return `${diffHours} hour${diffHours > 1 ? "s" : ""} ago`;

  const diffDays = Math.floor(diffHours / 24);
  return `${diffDays} day${diffDays > 1 ? "s" : ""} ago`;
}

export default function GovernancePetition() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [petition, setPetition] = useState(null);
  const [response, setResponse] = useState("");
  const [newStatus, setNewStatus] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const isOfficial = user?.role === "official";

  /* 🔁 FETCH PETITION BY ID (BACKEND READY) */
  useEffect(() => {
    fetchPetition();
  }, [id]);

  const fetchPetition = async () => {
    try {
      setLoading(true);
      setError("");

      // 🔁 Replace with real backend endpoint
      const res = await fetch(`/api/petitions/${id}`);

      if (!res.ok) throw new Error("Failed to load petition");

      const data = await res.json();
      setPetition(data);
    } catch (err) {
      setError("Unable to load petition details");
    } finally {
      setLoading(false);
    }
  };

  if (loading) return null;
  if (error) return <p>{error}</p>;
  if (!petition) return null;

  const progress = Math.round(
    (petition.signatureCount / petition.goal) * 100
  );

  /* 🔁 SUBMIT OFFICIAL RESPONSE (BACKEND READY) */
  const handleSubmit = async () => {
    if (!response.trim()) return;

    try {
      setSubmitting(true);

      const payload = {
        text: response,
        status: newStatus || petition.status,
      };

      // 🔁 Replace with real backend endpoint
      const res = await fetch(`/api/petitions/${id}/response`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${user?.token}`,
        },
        body: JSON.stringify(payload),
      });


      if (!res.ok) throw new Error("Submission failed");

      const savedResponse = await res.json();

      setPetition((prev) => ({
        ...prev,
        status: savedResponse.status || prev.status,
        responses: [savedResponse, ...(prev.responses || [])],
      }));

      setResponse("");
      setNewStatus("");
      setSuccessMsg("Response submitted successfully");

      setTimeout(() => setSuccessMsg(""), 3000);
    } catch (err) {
      console.error(err);
      setSuccessMsg("Backend not connected. Response not saved.");
      setTimeout(() => setSuccessMsg(""), 3000);
    }
    finally {
          setSubmitting(false);
        }
      };

  return (
    <div className="app-layout">
      <Sidebar />
      <div className="app-main">
        <Topbar />

        <main className="app-content govp-root">
          <button className="govp-back" onClick={() => navigate(-1)}>
            ← Back
          </button>

          {successMsg && <div className="govp-success">{successMsg}</div>}

          <div className="govp-grid">
            {/* LEFT CARD */}
            <div className="govp-card">
              <div className="govp-header">
                <h2>{petition.title}</h2>
                <span className="govp-status">
                  {petition.status?.replace("_", " ")}
                </span>
              </div>

              <div className="govp-meta">
                <span>⏱ {timeAgo(petition.createdAt)}</span>
                <span>📍 {petition.location}</span>
                <span>🏷 {petition.category}</span>
              </div>

              <h4>Description</h4>
              <p>{petition.description}</p>

              <div className="govp-signatures">
                <div className="govp-sign-head">
                  <strong>👥 Signatures</strong>
                  <span>{progress}% complete</span>
                </div>

                <div className="govp-progress">
                  <span style={{ width: `${progress}%` }} />
                </div>

                <div className="govp-sign-foot">
                  <span>{petition.signatureCount} signatures</span>
                  <span>🎯 Goal: {petition.goal}</span>
                </div>
              </div>
            </div>

            {/* RIGHT CARD */}
            {isOfficial && (
              <div className="govp-side">
                <h3>
                  <span className="govp-icon">🛡</span>
                  Submit Official Response
                </h3>

                <div className="govp-field status-row">
                  <label>Current Status</label>
                  <span className="govp-pill">
                    {petition.status?.replace("_", " ")}
                  </span>
                </div>

                <div className="govp-field">
                  <label>Your Response</label>
                  <textarea
                    placeholder="Enter your official response..."
                    value={response}
                    onChange={(e) => setResponse(e.target.value)}
                  />
                </div>

                <div className="govp-field">
                  <label>Update Status</label>
                  <select
                    value={newStatus}
                    onChange={(e) => setNewStatus(e.target.value)}
                  >
                    <option value="">No change</option>
                    <option value="under_review">Under Review</option>
                    <option value="closed">Closed</option>
                  </select>
                </div>

                <button
                  className={`govp-submit ${submitting ? "disabled" : ""}`}
                  disabled={submitting}
                  onClick={handleSubmit}
                >
                  {submitting ? "Submitting response…" : "Submit Response"}
                </button>
              </div>
            )}
          </div>

          {/* RESPONSES */}
          <div className="govp-responses">
            <h3>
              <span className="govp-icon">📢</span>
              Official Responses
            </h3>

            {petition.responses?.length === 0 ? (
              <p className="govp-empty">No responses yet</p>
            ) : (
              petition.responses?.map((r) => (
                <div key={r._id || r.id} className="govp-response">
                  <div className="govp-response-head">
                    <strong>{r.official}</strong>
                    <span>{r.time}</span>
                  </div>
                  <p>{r.text}</p>
                  <span className="govp-pill small">
                    Status updated to: {r.status}
                  </span>
                </div>
              ))
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
