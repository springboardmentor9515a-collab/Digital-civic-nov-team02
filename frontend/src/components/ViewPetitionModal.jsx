import React, { useEffect, useState } from "react";
import "../styles/createPetition.css";
import { signPetitionApi, getSinglePetitionApi } from "../api/petitions";
import { useAuth } from "../context/AuthProvider";

function getTimeAgo(dateString) {
  if (!dateString) return "Just now";
  const diff = Date.now() - new Date(dateString).getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes} minute${minutes > 1 ? "s" : ""} ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} hour${hours > 1 ? "s" : ""} ago`;
  const days = Math.floor(hours / 24);
  return `${days} day${days > 1 ? "s" : ""} ago`;
}

export default function ViewPetitionModal({ petition, open, onOpenChange }) {
  const { user } = useAuth();

  const [resolvedLocation, setResolvedLocation] = useState("");
  const [localPetition, setLocalPetition] = useState(petition);

  const [signing, setSigning] = useState(false);
  const [signed, setSigned] = useState(false);
  const [error, setError] = useState("");

  // Sync petition when modal opens or petition changes
  useEffect(() => {
    setLocalPetition(petition);
    setSigned(false);
    setError("");
  }, [petition]);

  // Refresh petition details (signatureCount etc.)
  useEffect(() => {
    if (!open || !petition?._id) return;

    (async () => {
      try {
        const res = await getSinglePetitionApi(petition._id);
        setLocalPetition(res.data);
      } catch (err) {
        console.error("Failed to refresh petition details:", err);
      }
    })();
  }, [open, petition?._id]);

  // Resolve location display
  useEffect(() => {
    if (!localPetition) return;

    if (typeof localPetition.location === "object" && localPetition.location?.name) {
      setResolvedLocation(localPetition.location.name);
      return;
    }

    if (typeof localPetition.location === "string") {
      setResolvedLocation(localPetition.location);
      return;
    }

    // last fallback only
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (pos) => {
          try {
            const res = await fetch(
              `https://nominatim.openstreetmap.org/reverse?format=json&lat=${pos.coords.latitude}&lon=${pos.coords.longitude}`
            );
            const data = await res.json();
            setResolvedLocation(data.display_name || "Location not specified");
          } catch {
            setResolvedLocation("Location not specified");
          }
        },
        () => setResolvedLocation("Location not specified")
      );
    }
  }, [localPetition]);

  if (!open || !localPetition) return null;

  const signatureCount = Number(localPetition.signatureCount || 0);
  const goal = Number(localPetition.goal || 100);
  const progress = goal > 0 ? Math.min((signatureCount / goal) * 100, 100) : 0;

  const status = (localPetition.status || "active").toLowerCase();

  const creatorName = localPetition?.creator?.name || "Unknown";
  const creatorRole = localPetition?.creator?.role || "citizen";

  const isCitizen = user?.role === "citizen";

  const canSign = isCitizen && !signed && !signing && status === "active";

  // ✅ Milestone-4: Read-only official response (public transparency view)
  const officialText =
    localPetition?.officialResponse?.comment ||
    localPetition?.officialResponseText ||
    "";

  const officialAt =
    localPetition?.officialResponse?.respondedAt ||
    localPetition?.respondedAt ||
    null;

  async function handleSign() {
    setError("");
    const petitionId = localPetition._id || localPetition.id;
    if (!petitionId) return;

    if (!isCitizen) {
      setError("Only citizens can sign petitions.");
      return;
    }
    if (status !== "active") {
      setError("This petition is not active.");
      return;
    }

    // Optimistic UI
    setSigning(true);
    setSigned(true);
    setLocalPetition((prev) => ({
      ...prev,
      signatureCount: Number(prev?.signatureCount || 0) + 1,
    }));

    try {
      const res = await signPetitionApi(petitionId);
      const serverCount = res?.data?.signatureCount;

      if (typeof serverCount === "number") {
        setLocalPetition((prev) => ({
          ...prev,
          signatureCount: serverCount,
        }));
      }
    } catch (err) {
      // rollback
      setSigned(false);
      setLocalPetition((prev) => ({
        ...prev,
        signatureCount: Math.max(Number(prev?.signatureCount || 1) - 1, 0),
      }));
      setError(err?.response?.data?.message || "Unable to sign petition.");
    } finally {
      setSigning(false);
    }
  }

  return (
    <div className="cp-overlay">
      <div className="cp-modal">
        <div className="cp-header">
          <h2 style={{ color: "#111827" }}>{localPetition.title}</h2>
          <button className="cp-close" onClick={() => onOpenChange(false)}>
            ✕
          </button>
        </div>

        <div style={{ fontSize: 13, color: "#6b7280", marginBottom: 10 }}>
          Created by <strong>{creatorName}</strong> ({creatorRole})
        </div>

        <div
          style={{
            display: "flex",
            gap: 12,
            alignItems: "center",
            marginBottom: 14,
          }}
        >
          <span
            style={{
              background:
                status === "active"
                  ? "#dcfce7"
                  : status === "closed"
                  ? "#fee2e2"
                  : "#fef3c7",
              color:
                status === "active"
                  ? "#15803d"
                  : status === "closed"
                  ? "#b91c1c"
                  : "#92400e",
              padding: "4px 12px",
              borderRadius: 999,
              fontSize: 12,
              fontWeight: 600,
              textTransform: "capitalize",
            }}
          >
            {status === "under_review" ? "under review" : status}
          </span>

          <span style={{ fontSize: 13, color: "#6b7280" }}>
            ⏱ {getTimeAgo(localPetition.createdAt)}
          </span>
        </div>

        <div style={{ display: "flex", gap: 20, marginBottom: 18 }}>
          <span style={{ fontSize: 14, color: "#374151" }}>
            📍 {resolvedLocation || "Location not specified"}
          </span>
          <span style={{ fontSize: 14, color: "#374151" }}>
            🏷 {localPetition.category || "General"}
          </span>
        </div>

        <div style={{ marginBottom: 22 }}>
          <h4 style={{ marginBottom: 6, color: "#111827" }}>Description</h4>
          <p style={{ color: "#4b5563", lineHeight: 1.6 }}>
            {localPetition.description}
          </p>
        </div>

        {/* ✅ Milestone-4: Official response read-only */}
        <div style={{ marginBottom: 22 }}>
          <h4 style={{ marginBottom: 6, color: "#111827" }}>Official Response</h4>

          {officialText ? (
            <div
              style={{
                background: "#f3f4f6",
                padding: 12,
                borderRadius: 12,
                border: "1px solid #e5e7eb",
              }}
            >
              <p style={{ color: "#374151", lineHeight: 1.6, marginBottom: 8 }}>
                <strong style={{ color: "#111827" }}>🛡 Official:</strong>{" "}
                {officialText}
              </p>

              <div style={{ fontSize: 13, color: "#6b7280" }}>
                {officialAt ? `Responded ${getTimeAgo(officialAt)}` : ""}
              </div>
            </div>
          ) : (
            <p style={{ color: "#6b7280" }}>No official response yet.</p>
          )}
        </div>

        <div style={{ background: "#f9fafb", padding: 14, borderRadius: 12 }}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              marginBottom: 6,
            }}
          >
            <strong style={{ color: "#111827" }}>👥 Signatures</strong>
            <span style={{ fontSize: 13, color: "#6b7280" }}>
              {Math.round(progress)}% complete
            </span>
          </div>

          <div className="pt-progress">
            <span style={{ width: `${progress}%` }} />
          </div>

          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              marginTop: 8,
              fontSize: 14,
              color: "#374151",
            }}
          >
            <span>
              <strong>{signatureCount}</strong> signatures
            </span>
            <span>🎯 Goal: {goal}</span>
          </div>
        </div>

        {error ? (
          <div className="cp-error" style={{ marginTop: 12 }}>
            {error}
          </div>
        ) : null}

        <div className="cp-actions" style={{ marginTop: 22 }}>
          <button
            className="cp-cancel"
            onClick={() => onOpenChange(false)}
            disabled={signing}
          >
            Close
          </button>

          {isCitizen && (
            <button onClick={handleSign} disabled={!canSign}>
              {signed ? "Signed" : signing ? "Signing..." : "Sign Petition"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}