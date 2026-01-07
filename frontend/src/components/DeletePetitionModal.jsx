import React from "react";
import "../styles/deletePetition.css";

export default function DeletePetitionModal({
  petition,
  open,
  onClose,
  onConfirm,
}) {
  // ✅ Guard against async / missing data
  if (!open || !petition) return null;

  // ✅ Backend-safe ID handling
  const petitionId = petition._id || petition.id;

  return (
    <div className="dp-overlay">
      <div className="dp-modal">
        <h3 className="dp-title">Delete Petition</h3>

        <p className="dp-text">
          Are you sure you want to delete{" "}
          <strong>
            "{petition.title || "this petition"}"
          </strong>
          ? This action cannot be undone.
        </p>

        <div className="dp-actions">
          <button className="dp-cancel" onClick={onClose}>
            Cancel
          </button>

          <button
            className="dp-delete"
            onClick={() => onConfirm(petitionId)}
            disabled={!petitionId}
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}
