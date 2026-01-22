import React, { useEffect, useMemo, useState } from "react";
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
  if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? "s" : ""} ago`;

  const diffDays = Math.floor(diffHours / 24);
  return `${diffDays} day${diffDays > 1 ? "s" : ""} ago`;
}

export default function GovernancePetition() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();

  const isOfficial = user?.role === "official";

  const [petition, setPetition] = useState(null);

  // Milestone-4: response + status update in ONE submit
  const [comment, setComment] = useState("");
  const [newStatus, setNewStatus] = useState(""); // under_review | closed

  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // ✅ Officials only
  useEffect(() => {
    if (!authLoading && user && !isOfficial) {
      navigate("/dashboard");
    }
  }, [authLoading, user, isOfficial, navigate]);

  /* FETCH PETITION BY ID (Public detail API is ok for reading) */
  useEffect(() => {
    if (!id || authLoading || !isOfficial) return;
    fetchPetition();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, authLoading, isOfficial]);

  const fetchPetition = async () => {
    try {
      setLoading(true);
      setError("");

      const res = await fetch(`/api/petitions/${id}`, {
        credentials: "include",
      });

      if (!res.ok) {
        const msg = (await res.json().catch(() => null))?.message;
        throw new Error(msg || "Failed to load petition");
      }

      const data = await res.json();
      setPetition(data);

      // Prefill comment if already responded (structured response)
      const existingComment =
        data?.officialResponse?.comment ||
        data?.officialResponseText ||
        "";
      setComment(existingComment);

      // Do not auto-change status selection; keep empty so official chooses explicitly
      setNewStatus("");
    } catch (err) {
      setError(err?.message || "Unable to load petition details");
    } finally {
      setLoading(false);
    }
  };

  const progress = useMemo(() => {
    if (!petition) return 0;
    const goal = Number(petition.goal || 0);
    if (!goal) return 0;
    return Math.min(
      Math.round((Number(petition.signatureCount || 0) / goal) * 100),
      100
    );
  }, [petition]);

  const existingResponseText =
    petition?.officialResponse?.comment ||
    petition?.officialResponseText ||
    "";

  const existingRespondedAt =
    petition?.officialResponse?.respondedAt ||
    petition?.respondedAt ||
    null;

  /* ✅ Milestone-4: Submit response + status to governance endpoint */
  const handleSubmitResponse = async () => {
    try {
      setSuccessMsg("");
      setError("");

      const trimmed = String(comment || "").trim();
      if (!trimmed) {
        setError("Response comment is required.");
        return;
      }
      if (!newStatus) {
        setError("Please select a status update (under_review or closed).");
        return;
      }

      setSubmitting(true);

      const res = await fetch(`/api/governance/petitions/${id}/respond`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          comment: trimmed, // ✅ matches your backend controller
          status: newStatus, // ✅ under_review | closed
        }),
      });

      if (!res.ok) {
        const msg = (await res.json().catch(() => null))?.message;
        throw new Error(msg || "Failed to submit response");
      }

      const payload = await res.json();
      const updatedPetition = payload?.data || payload?.petition;

      setPetition(updatedPetition);
      setNewStatus("");
      setSuccessMsg("Response submitted successfully");

      setTimeout(() => setSuccessMsg(""), 2500);
    } catch (err) {
      setError(err?.message || "Unable to submit response");
    } finally {
      setSubmitting(false);
    }
  };

  if (authLoading) return <div style={{ padding: 16 }}>Loading...</div>;
  if (!user) return <div style={{ padding: 16 }}>Please login again</div>;
  if (!isOfficial) return null;

  if (loading) return null;
  if (error) return <p style={{ padding: 16 }}>{error}</p>;
  if (!petition) return null;

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

              {/* ✅ Public Transparency View (read-only) */}
              <div style={{ marginTop: 18 }}>
                <h4>Official Response</h4>
                {existingResponseText ? (
                  <div className="govp-response-box">
                    <p style={{ marginBottom: 8 }}>{existingResponseText}</p>
                    <div style={{ fontSize: 13, color: "#6b7280" }}>
                      {existingRespondedAt
                        ? `Responded ${timeAgo(existingRespondedAt)}`
                        : ""}
                    </div>
                  </div>
                ) : (
                  <p style={{ color: "#6b7280" }}>No official response yet.</p>
                )}
              </div>
            </div>

            {/* RIGHT CARD — Milestone-4 Response Interface */}
            <div className="govp-side">
              <h3>
                <span className="govp-icon">🛡</span>
                Respond to Petition
              </h3>

              <div className="govp-field status-row">
                <label>Current Status</label>
                <span className="govp-pill">
                  {petition.status?.replace("_", " ")}
                </span>
              </div>

              <div className="govp-field">
                <label>Official Comment</label>
                <textarea
                  placeholder="Write your official response..."
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  rows={5}
                  disabled={submitting}
                />
              </div>

              <div className="govp-field">
                <label>Update Status</label>
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value)}
                  disabled={submitting}
                >
                  <option value="">Select status</option>
                  <option value="under_review">Under Review</option>
                  <option value="closed">Closed</option>
                </select>
              </div>

              {error && <div className="govp-error">{error}</div>}

              <button
                className={`govp-submit ${submitting ? "disabled" : ""}`}
                disabled={submitting}
                onClick={handleSubmitResponse}
              >
                {submitting ? "Submitting…" : "Submit Response"}
              </button>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
