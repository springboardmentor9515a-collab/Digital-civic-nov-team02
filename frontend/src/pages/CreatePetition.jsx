import React, { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, useMap } from "react-leaflet";
import L from "leaflet";
import { useAuth } from "../context/AuthProvider";
import { createPetitionApi } from "../api/petitions";
import "../styles/createPetition.css";

/* 🔧 Fix Leaflet marker icons */
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

/* 🔁 Fly map to new location */
function FlyToLocation({ position }) {
  const map = useMap();
  useEffect(() => {
    if (position) map.flyTo(position, 13);
  }, [position, map]);
  return null;
}

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

  /* 🌍 Location state */
  const [location, setLocation] = useState({
    lat: null,
    lng: null,
    label: "",
  });

  const [search, setSearch] = useState("");
  const [suggestions, setSuggestions] = useState([]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  /* 📍 Auto-detect current location */
  useEffect(() => {
    if (!navigator.geolocation) return;

    navigator.geolocation.getCurrentPosition((pos) => {
      setLocation({
        lat: pos.coords.latitude,
        lng: pos.coords.longitude,
        label: "Current Location",
      });
    });
  }, []);

  /* 🔍 Location autocomplete (Nominatim) */
  useEffect(() => {
    if (search.length < 3) {
      setSuggestions([]);
      return;
    }

    const fetchLocations = async () => {
      try {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=${search}&addressdetails=1&limit=5`,
          {
            headers: {
              Accept: "application/json",
              "User-Agent": "CivixApp/1.0 (contact@civix.com)",
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
  }, [search]);

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    if (
      !form.title ||
      !form.category ||
      !form.signatureGoal ||
      !form.description ||
      !location.lat
    ) {
      setError("Please fill all required fields.");
      return;
    }

    try {
      setLoading(true);
      await createPetitionApi({
        ...form,
        location,
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
          <button className="cp-close" onClick={onClose} type="button">
            ✕
          </button>
        </div>

        {/* FORM */}
        <form className="cp-form" onSubmit={handleSubmit}>
          {/* TITLE */}
          <label className="cp-label">Petition Title</label>
          <input
            name="title"
            value={form.title}
            onChange={handleChange}
            placeholder="Give your petition a clear, specific title"
          />

          {/* CATEGORY */}
          <label className="cp-label">Category</label>
          <select
            name="category"
            value={form.category}
            onChange={handleChange}
          >
            <option value="">Select category</option>
            {categories.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>

          {/* LOCATION SEARCH */}
          <label className="cp-label">Location</label>
          <div style={{ position: "relative" }}>
            <input
              placeholder="Search city, state or country"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />

            {suggestions.length > 0 && (
              <div className="cp-suggestions">
                {suggestions.map((s) => (
                  <div
                    key={s.place_id}
                    className="cp-suggestion"
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

          {/* MAP */}
          {location.lat && (
            <MapContainer
              key={`${location.lat}-${location.lng}`}
              center={[location.lat, location.lng]}
              zoom={13}
              style={{
                height: "220px",
                borderRadius: "12px",
                marginTop: "10px",
              }}
            >
              <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
              <Marker position={[location.lat, location.lng]} />
              <FlyToLocation position={[location.lat, location.lng]} />
            </MapContainer>
          )}

          {/* SIGNATURE GOAL */}
          <label className="cp-label">Signature Goal</label>
          <input
            type="number"
            name="signatureGoal"
            value={form.signatureGoal}
            onChange={handleChange}
            placeholder="e.g. 100"
          />

          {/* DESCRIPTION */}
          <label className="cp-label">Description</label>
          <textarea
            name="description"
            rows="4"
            value={form.description}
            onChange={handleChange}
            placeholder="Describe the issue and the change you'd like to see..."
          />

          <div className="cp-info">
            ℹ️ By submitting this petition, you acknowledge that the content is
            factual and follows Civix community guidelines.
          </div>

          {error && <p className="cp-error">{error}</p>}

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
