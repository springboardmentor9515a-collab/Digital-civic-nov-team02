import React, { useEffect, useState } from "react";
import { useAuth } from "../context/AuthProvider";
import "../styles/createPoll.css";

export default function CreatePollModal({ onClose }) {
  const { user } = useAuth();

  const [question, setQuestion] = useState("");
  const [description, setDescription] = useState("");
  const [options, setOptions] = useState(["", ""]);
  const [closeDate, setCloseDate] = useState("");

  // 📍 location search
  const [location, setLocation] = useState(user?.location || "");
  const [suggestions, setSuggestions] = useState([]);

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  /* 🔍 location autocomplete */
  useEffect(() => {
    if (!location || location.length < 3) {
      setSuggestions([]);
      return;
    }

    const fetchLocations = async () => {
      try {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=${location}&limit=5`,
          {
            headers: {
              "User-Agent": "CivixApp/1.0",
            },
          }
        );
        const data = await res.json();
        setSuggestions(data);
      } catch {
        setSuggestions([]);
      }
    };

    fetchLocations();
  }, [location]);

  /* ➕ add option */
  function addOption() {
    if (options.length >= 10) return;
    setOptions([...options, ""]);
  }

  /* ➖ remove option */
  function removeOption(index) {
    if (options.length <= 2) return;
    setOptions(options.filter((_, i) => i !== index));
  }

  function updateOption(index, value) {
    const updated = [...options];
    updated[index] = value;
    setOptions(updated);
  }

  /* 📅 max 30 days */
  function getMaxDate() {
    const d = new Date();
    d.setDate(d.getDate() + 30);
    return d.toISOString().split("T")[0];
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    if (!question || options.some((o) => !o) || !location || !closeDate) {
      setError("Please fill all required fields.");
      return;
    }

    try {
      setLoading(true);

      // 🔗 API call will be plugged here later
      console.log({
        question,
        description,
        options,
        location,
        closeDate,
      });

      onClose();
    } catch {
      setError("Failed to create poll");
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
            <h2 className="cp-title">Create a New Poll</h2>
            <p className="cp-sub">
              Create a poll to gather community feedback on local issues.
            </p>
          </div>
          <button className="cp-close" onClick={onClose}>✕</button>
        </div>

        {/* FORM */}
        <form className="cp-form" onSubmit={handleSubmit}>
          {/* QUESTION */}
          <label className="cp-label">Poll Question *</label>
          <input
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="What do you want to ask the community?"
          />
          <small className="cp-hint">Keep your question clear and specific.</small>

          {/* DESCRIPTION */}
          <label className="cp-label">Description</label>
          <textarea
            rows="3"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Provide more context about the poll..."
          />

          {/* OPTIONS */}
          <label className="cp-label">Poll Options *</label>
          {options.map((opt, i) => (
            <div key={i} className="cp-option-row">
              <input
                value={opt}
                placeholder={`Option ${i + 1}`}
                onChange={(e) => updateOption(i, e.target.value)}
              />
              {options.length > 2 && (
                <button
                  type="button"
                  className="cp-remove"
                  onClick={() => removeOption(i)}
                >
                  ✕
                </button>
              )}
            </div>
          ))}

          {options.length < 10 && (
            <button
              type="button"
              className="cp-add"
              onClick={addOption}
            >
              Add Option
            </button>
          )}

          <small className="cp-hint">
            Add at least 2 options, up to a maximum of 10.
          </small>

          {/* LOCATION */}
          <label className="cp-label">Target Location *</label>
          <div style={{ position: "relative" }}>
            <input
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="Search city, state or country"
            />

            {suggestions.length > 0 && (
              <div className="cp-suggestions">
                {suggestions.map((s) => (
                  <div
                    key={s.place_id}
                    className="cp-suggestion"
                    onClick={() => {
                      setLocation(s.display_name);
                      setSuggestions([]);
                    }}
                  >
                    {s.display_name}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* CLOSE DATE */}
          <label className="cp-label">Closes On *</label>
          <input
            type="date"
            max={getMaxDate()}
            value={closeDate}
            onChange={(e) => setCloseDate(e.target.value)}
          />
          <small className="cp-hint">
            Choose when this poll will close (max 30 days).
          </small>

          {/* INFO */}
          <div className="cp-info">
            ⚠️ Polls should gather genuine community feedback.
            Misleading or agenda-driven polls may be removed.
          </div>

          {error && <p className="cp-error">{error}</p>}

          {/* ACTIONS */}
          <div className="cp-actions">
            <button type="button" className="cp-cancel" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" disabled={loading}>
              {loading ? "Creating..." : "Create Poll"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}