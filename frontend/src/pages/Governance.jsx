import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";
import { useAuth } from "../context/AuthProvider";
import "../styles/governance.css";

/* CATEGORY OPTIONS (STATIC) */
const CATEGORIES = [
  "all",
  "Environment",
  "Infrastructure",
  "Education",
  "Public Safety",
  "Transportation",
  "Healthcare",
  "Housing",
];

export default function Governance() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [petitions, setPetitions] = useState([]);
  const [statusFilter, setStatusFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const isOfficial = user?.role === "official";

  /* 🔁 FETCH PETITIONS (BACKEND READY) */
  useEffect(() => {
    fetchPetitions();
  }, []);

  const fetchPetitions = async () => {
    try {
      setLoading(true);
      setError("");

      // 🔁 Replace URL when backend is ready
      const response = await fetch("/api/petitions");

      if (!response.ok) {
        throw new Error("Failed to fetch petitions");
      }

      const data = await response.json();
      setPetitions(data || []);
    } catch (err) {
      setError("Unable to load petitions");
    } finally {
      setLoading(false);
    }
  };

  /* FILTERED DATA */
  const filtered = petitions.filter(
    (p) =>
      (statusFilter === "all" || p.status === statusFilter) &&
      (categoryFilter === "all" || p.category === categoryFilter)
  );

  /* COUNTS (DERIVED DYNAMICALLY) */
  const counts = {
    total: petitions.length,
    active: petitions.filter((p) => p.status === "active").length,
    review: petitions.filter((p) => p.status === "under_review").length,
    closed: petitions.filter((p) => p.status === "closed").length,
  };

  const formatDate = (date) => {
    if (!date) return "-";
    return new Date(date).toLocaleDateString();
  };

  return (
    <div className="app-layout">
      <Sidebar />

      <div className="app-main">
        <Topbar />

        <main className="app-content">
          <div className="gov-header">
            {isOfficial && <span className="gov-badge">OFFICIALS ONLY</span>}
            <h2>Governance Dashboard</h2>
            <p>
              {isOfficial
                ? "Manage and respond to petitions in your jurisdiction."
                : "View petitions and official responses."}
            </p>
          </div>

          {/* SUMMARY CARDS */}
          <div className="gov-cards">
            <StatCard
              label="Total Petitions"
              value={counts.total}
              sub="In your jurisdiction"
              icon="📄"
            />
            <StatCard
              label="Active Petitions"
              value={counts.active}
              sub="Awaiting response"
              icon="🕒"
            />
            <StatCard
              label="Under Review"
              value={counts.review}
              sub="Being processed"
              icon="⏳"
            />
            <StatCard
              label="Closed"
              value={counts.closed}
              sub="Resolved petitions"
              icon="✅"
            />
          </div>

          {/* FILTERS */}
          <div className="gov-filters">
            <h3>Petitions List</h3>

            <div className="gov-filter-group">
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
              >
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c === "all" ? "All Categories" : c}
                  </option>
                ))}
              </select>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="all">Status: All</option>
                <option value="active">Active</option>
                <option value="under_review">Under Review</option>
                <option value="closed">Closed</option>
              </select>
            </div>
          </div>

          {/* TABLE */}
          <div className="gov-table">
            <div className="gov-row gov-head">
              <span>Title</span>
              <span>Category</span>
              <span>Signatures</span>
              <span>Status</span>
              <span>Created</span>
              <span>Action</span>
            </div>

            {loading && <p>Loading petitions...</p>}
            {error && <p>{error}</p>}

            {!loading &&
              !error &&
              filtered.map((p) => (
                <div key={p._id} className="gov-row">
                  <div>
                    <strong>{p.title}</strong>
                    <p>{p.description}</p>
                  </div>

                  <span>{p.category}</span>

                  <span>
                    {p.signatureCount}/{p.goal}
                  </span>

                  <span className={`gov-status ${p.status}`}>
                    {p.status === "under_review" ? "Review" : p.status}
                  </span>

                  <span>{formatDate(p.createdAt)}</span>

                  <button
                    className="gov-action-btn"
                    onClick={() => navigate(`/governance/${p._id}`)}
                  >
                    {isOfficial ? "View & Respond" : "View"}
                  </button>
                </div>
              ))}

            {!loading && !error && filtered.length === 0 && (
              <p>No petitions found</p>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}

/* STAT CARD */
function StatCard({ label, value, sub, icon }) {
  return (
    <div className="gov-card">
      <div className="gov-card-top">
        <span>{label}</span>
        <div className="gov-icon">{icon}</div>
      </div>
      <strong>{value}</strong>
      <p>{sub}</p>
    </div>
  );
}
