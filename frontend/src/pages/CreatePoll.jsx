import React, { useEffect, useState } from "react";
import { useAuth } from "../context/AuthProvider";
import "../styles/createPoll.css";

export default function CreatePollModal({ onClose }) {
  const { user } = useAuth();

  const [question, setQuestion] = useState("");
  const [description, setDescription] = useState("");
  const [options, setOptions] = useState(["", ""]);
  const [closeDate, setCloseDate] = useState("");

  // Location search
  const [location, setLocation] = useState("");
  const [suggestions, setSuggestions] = useState([]);

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  /* =======================
     LOCATION AUTOCOMPLETE
     ======================= */
  useEffect(() => {
    if (!location || location.length < 3) {
      setSuggestions([]);
      return;
    }

    const fetchLocations = async () => {
      try {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=${location}&limit=5`,
          { headers: { "User-Agent": "CivixApp/1.0" } }
        );
        setSuggestions(await res.json());
      } catch {
        setSuggestions([]);
      }
    };

    fetchLocations();
  }, [location]);

  /* =======================
     OPTIONS HELPERS
     ======================= */
  function addOption() {
    if (options.length < 10) setOptions([...options, ""]);
  }

  function removeOption(i) {
    if (options.length > 2) {
      setOptions(options.filter((_, idx) => idx !== i));
    }
  }

  function updateOption(i, val) {
    const copy = [...options];
    copy[i] = val;
    setOptions(copy);
  }

  function getMaxDate() {
    const d = new Date();
    d.setDate(d.getDate() + 30);
    return d.toISOString().split("T")[0];
  }

  /* =======================
     SUBMIT POLL
     ======================= */
  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    if (!question || options.some(o => !o) || !location || !closeDate) {
      setError("Please fill all required fields.");
      return;
    }

    try {
      setLoading(true);

      const res = await fetch("/api/polls", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          question,
          description,
          options,
          location,
          closeDate,
        }),
      });

      if (!res.ok) {
        throw new Error("Failed to create poll");
      }

      // Optional: const data = await res.json();
      onClose(); // ✅ close only on success
    } catch (err) {
      console.error(err);
      setError("Unable to create poll. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="cp-overlay">
      <div className="cp-modal">
        <div className="cp-header">
          <div>
            <h2>Create a New Poll</h2>
            <p>Create a poll to gather community feedback on local issues.</p>
          </div>
          <button className="cp-close" onClick={onClose}>✕</button>
        </div>

        <form className="cp-form" onSubmit={handleSubmit}>
          <label className="cp-label">Poll Question *</label>
          <input
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="What do you want to ask the community?"
          />

          <label className="cp-label">Description</label>
          <textarea
            rows="3"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Provide more context about the poll..."
          />

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
                  🗑️
                </button>
              )}
            </div>
          ))}

          {options.length < 10 && (
            <button type="button" className="cp-add" onClick={addOption}>
              Add Option
            </button>
          )}

          <label className="cp-label">Target Location *</label>
          <div style={{ position: "relative" }}>
            <input
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="📍 Search city, state or country"
            />

            {suggestions.length > 0 && (
              <div className="cp-suggestions">
                {suggestions.map(s => (
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

          <label className="cp-label">Closes On *</label>
          <input
            type="date"
            min={new Date().toISOString().split("T")[0]}
            max={getMaxDate()}
            value={closeDate}
            onChange={(e) => setCloseDate(e.target.value)}
            className="cp-date"
          />

          <div className="cp-info">
            ⚠️ Polls should gather genuine community feedback.
          </div>

          {error && <p className="cp-error">{error}</p>}

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
