import React from "react";

export default function PetitionsEmpty() {
  return (
    <div className="pe-empty">
      <div className="pe-icon">📄</div>
      <h4>No petitions found</h4>
      <p>Try adjusting your filters or create a new petition.</p>

      <button className="pe-btn">
        Clear Filters
      </button>
    </div>
  );
}
