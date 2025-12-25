import React, { useState } from "react";
import { useAuth } from "../context/AuthProvider";
import { createPetitionApi } from "../api/petitions";
import "../styles/createPetition.css";

export default function CreatePetitionModal({ onClose }) {
  const { user } = useAuth();

  const categories = [
    "Environment",
    "Infrastructure",
    "Education",
    "Public Safety",
    "Transportation",
    "Healthcare",
    "Housing",
  ];

  const [form, setForm] = useState({
    title: "",
    category: "",
    signatureGoal: "",
    description: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    if (!form.title || !form.category || !form.signatureGoal || !form.description) {
      setError("Please fill all required fields.");
      return;
    }

    try {
      setLoading(true);
      await createPetitionApi({
        ...form,
        location: user?.location,
      });
      onClose();
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to create petition");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="cp-overlay">
      <div className="cp-modal">
        {/* HEADER */}
        <div className="cp-header">
          <div>
            <h2 className="cp-title">Create a New Petition</h2>
            <p className="cp-sub">
              Complete the form below to create a petition in your community.
            </p>
          </div>

          <button
            className="cp-close"
            onClick={onClose}
            aria-label="Close"
            type="button"
          >
            ✕
          </button>
        </div>

        {/* FORM */}
        <form className="cp-form" onSubmit={handleSubmit}>
          {/* Petition Title */}
          <label className="cp-label">Petition Title</label>
          <input
            name="title"
            value={form.title}
            onChange={handleChange}
            placeholder="Give your petition a clear, specific title"
          />
          <small className="cp-hint">
            Choose a title that clearly states what change you want to see.
          </small>

          {/* Category + Location */}
          <div className="cp-row">
            <div className="cp-field">
              <label className="cp-label">Category</label>
              <select
                name="category"
                value={form.category}
                onChange={handleChange}
                className="cp-select"
              >
                <option value="">Select category</option>
                {categories.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            <div className="cp-field">
              <label className="cp-label">Location</label>
              <input value={user?.location || ""} disabled />
            </div>
          </div>

          {/* Signature Goal */}
          <label className="cp-label">Signature Goal</label>
          <input
            type="number"
            name="signatureGoal"
            value={form.signatureGoal}
            onChange={handleChange}
            placeholder="e.g. 100"
          />
          <small className="cp-hint">
            How many signatures are you aiming to collect?
          </small>

          {/* Description */}
          <label className="cp-label">Description</label>
          <textarea
            name="description"
            rows="4"
            value={form.description}
            onChange={handleChange}
            placeholder="Describe the issue and the change you'd like to see..."
          />
          <small className="cp-hint">
            Clearly explain the issue, why it matters, and what action you're requesting.
          </small>

          {/* INFO */}
          <div className="cp-info">
            ℹ️ By submitting this petition, you acknowledge that the content is
            factual and follows Civix community guidelines.
          </div>

          {error && <p className="cp-error">{error}</p>}

          {/* ACTIONS */}
          <div className="cp-actions">
            <button type="button" className="cp-cancel" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" disabled={loading}>
              {loading ? "Creating..." : "Create Petition"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
