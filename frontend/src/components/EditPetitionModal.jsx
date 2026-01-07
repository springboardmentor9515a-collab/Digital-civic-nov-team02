import React, { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import "../styles/editPetition.css";

const CATEGORIES = [
  "Environment",
  "Infrastructure",
  "Education",
  "Public Safety",
  "Transportation",
  "Healthcare",
  "Housing",
];

export default function EditPetitionModal({
  petition,
  open,
  onOpenChange,
  onSaved,
}) {
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("");
  const [goal, setGoal] = useState("");
  const [description, setDescription] = useState("");

  const [search, setSearch] = useState("");
  const [location, setLocation] = useState({
    lat: null,
    lng: null,
    label: "",
  });
  const [suggestions, setSuggestions] = useState([]);

  /* LOAD EXISTING PETITION DATA */
  useEffect(() => {
    if (open && petition) {
      setTitle(petition.title || "");
      setCategory(petition.category || "");
      setGoal(petition.goal || 100);
      setDescription(petition.description || "");
      setSearch(petition.location || "");

      fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${petition.location}&limit=1`
      )
        .then((res) => res.json())
        .then((data) => {
          if (data.length > 0) {
            setLocation({
              lat: Number(data[0].lat),
              lng: Number(data[0].lon),
              label: data[0].display_name,
            });
            setSearch(data[0].display_name);
          }
        })
        .catch(() => {
          setLocation({
            lat: null,
            lng: null,
            label: petition.location || "",
          });
        });
    }
  }, [open, petition]);

  /* LOCATION AUTOCOMPLETE */
  useEffect(() => {
    if (search.length < 3) {
      setSuggestions([]);
      return;
    }

    fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${search}&limit=5`
    )
      .then((r) => r.json())
      .then(setSuggestions)
      .catch(() => setSuggestions([]));
  }, [search]);

  function handleSubmit(e) {
    e.preventDefault();

    // ✅ BACKEND-READY PAYLOAD
    const payload = {
      id: petition?._id || petition?.id,
      title,
      category,
      goal: Number(goal),
      description,
      location: {
        name: location.label || search,
        coordinates:
          location.lat && location.lng
            ? [location.lng, location.lat]
            : null,
      },
    };

    // 🔗 API call will go here
    // await updatePetition(payload)

    console.log("Updated Petition Payload:", payload);

    onSaved?.(payload);
    onOpenChange(false);
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
          <div>
            <label className="ep-label">Petition Title</label>
            <input value={title} onChange={(e) => setTitle(e.target.value)} />
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
            <div>
              <label className="ep-label">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              >
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
              />

              {suggestions.length > 0 && (
                <div className="ep-suggestions">
                  {suggestions.map((s) => (
                    <div
                      key={s.place_id}
                      className="ep-suggestion"
                      onClick={() => {
                        setLocation({
                          lat: Number(s.lat),
                          lng: Number(s.lon),
                          label: s.display_name,
                        });
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
            />
          </div>

          <div>
            <label className="ep-label">Description</label>
            <textarea
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <div className="ep-info">
            ⚠️ By updating this petition, you acknowledge that the content is factual
            and does not contain misleading information.
          </div>

          <div className="ep-actions">
            <button
              type="button"
              className="ep-cancel"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </button>
            <button type="submit" className="ep-save">
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
