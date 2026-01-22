import React from "react";
import "../styles/deletePetition.css";

export default function DeletePetitionModal({
  petition,
  open,
  onClose,
  onConfirm,
  loading = false,
  error = "",
}) {
  if (!open || !petition) return null;

  const petitionId = petition._id || petition.id;

  return (
    <div className="dp-overlay">
      <div className="dp-modal">
        <h3 className="dp-title">Delete Petition</h3>

        <p className="dp-text">
          Are you sure you want to delete{" "}
          <strong>"{petition.title || "this petition"}"</strong>? This action cannot be undone.
        </p>

        {error ? <div className="dp-error">{error}</div> : null}

        <div className="dp-actions">
          <button className="dp-cancel" onClick={onClose} disabled={loading}>
            Cancel
          </button>

          <button
            className="dp-delete"
            onClick={() => onConfirm(petitionId)}
            disabled={!petitionId || loading}
          >
            {loading ? "Deleting..." : "Delete"}
          </button>
        </div>
      </div>
    </div>
  );
}
