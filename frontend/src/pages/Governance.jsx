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
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  const [petitions, setPetitions] = useState([]);
  const [statusFilter, setStatusFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const isOfficial = user?.role === "official";

  // ✅ Role protection (Milestone-4)
  useEffect(() => {
    if (!authLoading && user && !isOfficial) {
      navigate("/dashboard");
    }
  }, [authLoading, user, isOfficial, navigate]);

  /* 🔁 FETCH PETITIONS (Milestone-4 API) */
  useEffect(() => {
    if (!authLoading && isOfficial) {
      fetchPetitions();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authLoading, isOfficial, statusFilter]);

  const fetchPetitions = async () => {
    try {
      setLoading(true);
      setError("");

      const qs =
        statusFilter !== "all" ? `?status=${encodeURIComponent(statusFilter)}` : "";

      // ✅ Milestone-4 governance endpoint (official location filtered)
      const response = await fetch(`/api/governance/petitions${qs}`, {
        credentials: "include",
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.message || "Failed to fetch petitions");
      }

      const payload = await response.json();

      // Your backend returns { success, count, data }
      const list = payload?.data || [];
      setPetitions(Array.isArray(list) ? list : []);
    } catch (err) {
      setError(err?.message || "Unable to load petitions");
      setPetitions([]);
    } finally {
      setLoading(false);
    }
  };

  /* FILTERED DATA (Category filter frontend-only is OK) */
  const filtered = petitions.filter(
    (p) => categoryFilter === "all" || p.category === categoryFilter
  );

  /* COUNTS (DERIVED) */
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

  // Auth loading safety
  if (authLoading) return <div style={{ padding: 20 }}>Loading...</div>;
  if (!user) return <div style={{ padding: 20 }}>Please login again</div>;
  if (!isOfficial) return null;

  return (
    <div className="app-layout">
      <Sidebar />

      <div className="app-main">
        <Topbar />

        <main className="app-content">
          <div className="gov-header">
            <span className="gov-badge">OFFICIALS ONLY</span>
            <h2>Governance Dashboard</h2>
            <p>Manage and respond to petitions in your jurisdiction.</p>
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
                    <p>
                      {p.description?.length > 90
                        ? p.description.slice(0, 90) + "..."
                        : p.description}
                    </p>
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
                    View & Respond
                  </button>
                </div>
              ))}

            {!loading && !error && filtered.length === 0 && <p>No petitions found</p>}
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
