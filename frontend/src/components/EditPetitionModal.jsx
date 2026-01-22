import React, { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import "../styles/editPetition.css";
import { editPetitionApi } from "../api/petitions";

const CATEGORIES = [
  "Environment",
  "Infrastructure",
  "Education",
  "Public Safety",
  "Transportation",
  "Healthcare",
  "Housing",
];

export default function EditPetitionModal({ petition, open, onOpenChange, onSaved }) {
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("");
  const [goal, setGoal] = useState(100);
  const [description, setDescription] = useState("");

  const [search, setSearch] = useState("");
  const [location, setLocation] = useState({ lat: null, lng: null, label: "" });
  const [suggestions, setSuggestions] = useState([]);

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!open || !petition) return;

    setError("");
    setTitle(petition.title || "");
    setCategory(petition.category || "");
    setGoal(petition.goal || 100);
    setDescription(petition.description || "");
    setSearch(petition.location || "");

    fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
        petition.location || ""
      )}&limit=1`
    )
      .then((res) => res.json())
      .then((data) => {
        if (data?.length > 0) {
          setLocation({
            lat: Number(data[0].lat),
            lng: Number(data[0].lon),
            label: data[0].display_name,
          });
          setSearch(data[0].display_name);
        } else {
          setLocation({ lat: null, lng: null, label: petition.location || "" });
        }
      })
      .catch(() => {
        setLocation({ lat: null, lng: null, label: petition.location || "" });
      });
  }, [open, petition]);

  useEffect(() => {
    if (!open) return;

    if (search.length < 3) {
      setSuggestions([]);
      return;
    }

    const controller = new AbortController();

    fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
        search
      )}&limit=5`,
      { signal: controller.signal }
    )
      .then((r) => r.json())
      .then((data) => setSuggestions(Array.isArray(data) ? data : []))
      .catch(() => setSuggestions([]));

    return () => controller.abort();
  }, [search, open]);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    const petitionId = petition?._id || petition?.id;
    if (!petitionId) {
      setError("Invalid petition. Please refresh and try again.");
      return;
    }

    if (!title.trim() || !description.trim() || !category || !search.trim()) {
      setError("Please fill all required fields.");
      return;
    }

    const payload = {
      title: title.trim(),
      description: description.trim(),
      category,
      goal: Number(goal) || 100,
      location: location?.label ? { label: location.label } : search.trim(),
    };

    try {
      setSaving(true);
      const res = await editPetitionApi(petitionId, payload);
      const updated = res?.data?.petition || res?.data;

      onSaved?.(updated);
      onOpenChange(false);
    } catch (err) {
      console.error(err);
      setError(err?.response?.data?.message || "Failed to update petition");
    } finally {
      setSaving(false);
    }
  }

  if (!open || !petition) return null;

  return (
    <div className="ep-overlay">
      <div className="ep-modal">
        <div className="ep-header">
          <div>
            <h2>Edit Petition</h2>
            <p className="ep-sub">Update your petition details below.</p>
          </div>
          <button className="ep-close" onClick={() => onOpenChange(false)}>
            ✕
          </button>
        </div>

        <form className="ep-form" onSubmit={handleSubmit}>
          {error ? <div className="ep-error">{error}</div> : null}

          <div>
            <label className="ep-label">Petition Title</label>
            <input value={title} onChange={(e) => setTitle(e.target.value)} disabled={saving} />
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
            <div>
              <label className="ep-label">Category</label>
              <select value={category} onChange={(e) => setCategory(e.target.value)} disabled={saving}>
                <option value="">Select category</option>
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            <div style={{ position: "relative" }}>
              <label className="ep-label">Location</label>
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search location"
                disabled={saving}
              />

              {suggestions.length > 0 && (
                <div className="ep-suggestions">
                  {suggestions.map((s) => (
                    <div
                      key={s.place_id}
                      className="ep-suggestion"
                      onClick={() => {
                        setLocation({ lat: Number(s.lat), lng: Number(s.lon), label: s.display_name });
                        setSearch(s.display_name);
                        setSuggestions([]);
                      }}
                    >
                      {s.display_name}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {location.lat && location.lng && (
            <MapContainer
              center={[location.lat, location.lng]}
              zoom={13}
              style={{ height: 220, marginTop: 10, borderRadius: 12 }}
            >
              <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
              <Marker position={[location.lat, location.lng]} />
            </MapContainer>
          )}

          <div>
            <label className="ep-label">Signature Goal</label>
            <input
              type="number"
              value={goal}
              onChange={(e) => setGoal(e.target.value)}
              min={1}
              disabled={saving}
            />
          </div>

          <div>
            <label className="ep-label">Description</label>
            <textarea
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              disabled={saving}
            />
          </div>

          <div className="ep-actions">
            <button type="button" className="ep-cancel" onClick={() => onOpenChange(false)} disabled={saving}>
              Cancel
            </button>
            <button type="submit" className="ep-save" disabled={saving}>
              {saving ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
