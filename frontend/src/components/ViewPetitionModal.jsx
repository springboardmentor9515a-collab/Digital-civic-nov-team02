import React, { useEffect, useState } from "react";
import "../styles/createPetition.css";

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
  const [resolvedLocation, setResolvedLocation] = useState("");

  useEffect(() => {
    if (!petition) return;

    /**
     * ✅ BACKEND-FIRST LOCATION RESOLUTION
     * Priority:
     * 1. petition.location.name (backend)
     * 2. petition.location (string)
     * 3. GPS fallback (rare)
     */
    if (typeof petition.location === "object" && petition.location?.name) {
      setResolvedLocation(petition.location.name);
      return;
    }

    if (typeof petition.location === "string") {
      setResolvedLocation(petition.location);
      return;
    }

    // 🚨 LAST FALLBACK ONLY
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (pos) => {
          try {
            const res = await fetch(
              `https://nominatim.openstreetmap.org/reverse?format=json&lat=${pos.coords.latitude}&lon=${pos.coords.longitude}`
            );
            const data = await res.json();
            setResolvedLocation(
              data.display_name || "Location not specified"
            );
          } catch {
            setResolvedLocation("Location not specified");
          }
        },
        () => setResolvedLocation("Location not specified")
      );
    }
  }, [petition]);

  if (!open || !petition) return null;

  const signatureCount = Number(petition.signatureCount || 0);
  const goal = Number(petition.goal || 100);

  const progress = Math.min((signatureCount / goal) * 100, 100);

  const status = (petition.status || "active").toLowerCase();

  function handleSign() {
    // 🔗 API HOOK (to be wired later)
    const payload = {
      petitionId: petition._id || petition.id,
    };

    console.log("Sign Petition Payload:", payload);

    // await signPetition(payload)
  }

  return (
    <div className="cp-overlay">
      <div className="cp-modal">
        {/* HEADER */}
        <div className="cp-header">
          <h2 style={{ color: "#111827" }}>{petition.title}</h2>
          <button className="cp-close" onClick={() => onOpenChange(false)}>
            ✕
          </button>
        </div>

        {/* STATUS + TIME */}
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
            {status}
          </span>

          <span style={{ fontSize: 13, color: "#6b7280" }}>
            ⏱ {getTimeAgo(petition.createdAt)}
          </span>
        </div>

        {/* LOCATION + CATEGORY */}
        <div style={{ display: "flex", gap: 20, marginBottom: 18 }}>
          <span style={{ fontSize: 14, color: "#374151" }}>
            📍 {resolvedLocation || "Location not specified"}
          </span>
          <span style={{ fontSize: 14, color: "#374151" }}>
            🏷 {petition.category || "General"}
          </span>
        </div>

        {/* DESCRIPTION */}
        <div style={{ marginBottom: 22 }}>
          <h4 style={{ marginBottom: 6, color: "#111827" }}>
            Description
          </h4>
          <p style={{ color: "#4b5563", lineHeight: 1.6 }}>
            {petition.description}
          </p>
        </div>

        {/* SIGNATURES */}
        <div
          style={{
            background: "#f9fafb",
            padding: 14,
            borderRadius: 12,
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              marginBottom: 6,
            }}
          >
            <strong style={{ color: "#111827" }}>
              👥 Signatures
            </strong>
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

        {/* ACTIONS */}
        <div className="cp-actions" style={{ marginTop: 22 }}>
          <button
            className="cp-cancel"
            onClick={() => onOpenChange(false)}
          >
            Close
          </button>

          {status === "active" && (
            <button onClick={handleSign}>Sign Petition</button>
          )}
        </div>
      </div>
    </div>
  );
}
