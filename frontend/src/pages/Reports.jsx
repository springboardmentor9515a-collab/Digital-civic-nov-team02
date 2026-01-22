import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";
import { useAuth } from "../context/AuthProvider";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  Legend,
  Cell,
} from "recharts";
import "../styles/reports.css";

const BAR_COLORS = ["#2563eb", "#22c55e", "#f59e0b", "#7c3aed"];

function getRangeDates(range) {
  const now = new Date();
  const start = new Date(now);
  const end = new Date(now);

  // default: this month
  if (range === "This Month") {
    start.setDate(1);
  } else if (range === "Last Month") {
    start.setMonth(start.getMonth() - 1);
    start.setDate(1);
    end.setDate(0); // last day of previous month
  } else if (range === "Last 3 Months") {
    start.setMonth(start.getMonth() - 3);
  } else if (range === "Last 6 Months") {
    start.setMonth(start.getMonth() - 6);
  } else if (range === "This Year") {
    start.setMonth(0);
    start.setDate(1);
  } else {
    start.setDate(1);
  }

  const toISODate = (d) => d.toISOString().slice(0, 10);
  return { startDate: toISODate(start), endDate: toISODate(end) };
}

export default function Reports() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  const isOfficial = user?.role === "official";

  /* FILTERS */
  const [range, setRange] = useState("This Month");
  const [location, setLocation] = useState("");
  const [locationResults, setLocationResults] = useState([]);
  const [showLocations, setShowLocations] = useState(false);

  /* BACKEND RESPONSE */
  const [reportData, setReportData] = useState(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // ✅ Role guard
  useEffect(() => {
    if (!authLoading && user && !isOfficial) {
      navigate("/dashboard");
    }
  }, [authLoading, user, isOfficial, navigate]);

  const { startDate, endDate } = useMemo(() => getRangeDates(range), [range]);

  /* FETCH REPORTS FROM BACKEND */
  useEffect(() => {
    if (authLoading || !isOfficial) return;

    async function fetchReports() {
      try {
        setLoading(true);
        setError("");

        const qs = new URLSearchParams();
        qs.set("startDate", startDate);
        qs.set("endDate", endDate);
        if (location.trim()) qs.set("location", location.trim());

        const res = await fetch(`/api/reports?${qs.toString()}`, {
          credentials: "include",
        });

        if (!res.ok) {
          const msg = (await res.json().catch(() => null))?.message;
          throw new Error(msg || "Failed to fetch reports");
        }

        const data = await res.json();
        setReportData(data);
      } catch (err) {
        console.error(err);
        setReportData(null);
        setError(err?.message || "Failed to load reports");
      } finally {
        setLoading(false);
      }
    }

    fetchReports();
  }, [authLoading, isOfficial, startDate, endDate, location]);

  /* LOCATION SEARCH (NOMINATIM) */
  const searchLocation = async (query) => {
    if (!query || query.length < 3) return;

    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=5`
      );
      const data = await res.json();
      setLocationResults(Array.isArray(data) ? data : []);
      setShowLocations(true);
    } catch (err) {
      console.error("Location search failed", err);
      setLocationResults([]);
    }
  };

  /* ✅ CSV EXPORT (BACKEND — mandatory) */
  const exportCSV = async () => {
    try {
      const qs = new URLSearchParams();
      qs.set("startDate", startDate);
      qs.set("endDate", endDate);
      if (location.trim()) qs.set("location", location.trim());

      const res = await fetch(`/api/reports/export?${qs.toString()}`, {
        credentials: "include",
      });

      if (!res.ok) {
        const msg = (await res.json().catch(() => null))?.message;
        throw new Error(msg || "Export failed");
      }

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);

      const a = document.createElement("a");
      a.href = url;
      a.download = "reports.csv";
      a.click();

      window.URL.revokeObjectURL(url);
    } catch (err) {
      alert(err?.message || "Unable to export CSV");
    }
  };

  // ✅ Build UI-friendly metrics
  const metrics = useMemo(() => {
    if (!reportData?.data) return null;

    const petitions = reportData.data.petitions || {};
    const totals = reportData.data.totals || {};

    return {
      totalPetitions: petitions.total ?? 0,
      resolved: petitions.closed ?? 0,
      pending: petitions.under_review ?? 0,
      totalSignatures: totals.totalSignatures ?? 0,
      totalVotes: totals.totalVotes ?? 0,
    };
  }, [reportData]);

  // ✅ Status distribution for bar chart
  const statusDistribution = useMemo(() => {
    if (!reportData?.data?.petitions) return [];
    const p = reportData.data.petitions;

    return [
      { name: "Active", value: p.active ?? 0 },
      { name: "Under Review", value: p.under_review ?? 0 },
      { name: "Closed", value: p.closed ?? 0 },
    ];
  }, [reportData]);

  // Not provided by backend yet; keep empty but UI still works
  const categoryDistribution = [];
  const monthlyTrends = [];

  if (authLoading) return <div style={{ padding: 16 }}>Loading...</div>;
  if (!user) return <div style={{ padding: 16 }}>Please login again</div>;
  if (!isOfficial) return null;

  return (
    <div className="app-layout">
      <Sidebar />
      <div className="app-main">
        <Topbar />

        <main className="app-content reports-root">
          {/* HEADER */}
          <div className="reports-header">
            <div>
              <h2>Reports Dashboard</h2>
              <p>View analytics and metrics for governance activities.</p>
              <div style={{ fontSize: 13, color: "#6b7280", marginTop: 6 }}>
                Range: {startDate} → {endDate}
              </div>
            </div>

            <button className="export-btn" onClick={exportCSV} disabled={!reportData}>
              ⬇ Download CSV
            </button>
          </div>

          {/* FILTERS */}
          <div className="reports-filters">
            <select value={range} onChange={(e) => setRange(e.target.value)}>
              <option>This Month</option>
              <option>Last Month</option>
              <option>Last 3 Months</option>
              <option>Last 6 Months</option>
              <option>This Year</option>
            </select>

            <div className="location-input">
              📍
              <input
                placeholder="Search location (optional)"
                value={location}
                onChange={(e) => {
                  setLocation(e.target.value);
                  searchLocation(e.target.value);
                }}
                onBlur={() => setTimeout(() => setShowLocations(false), 150)}
              />

              {showLocations && (
                <div className="location-suggestions">
                  {locationResults.length === 0 ? (
                    <div className="suggestion">No results</div>
                  ) : (
                    locationResults.slice(0, 5).map((loc) => (
                      <div
                        key={loc.place_id}
                        className="suggestion"
                        onClick={() => {
                          setLocation(loc.display_name);
                          setShowLocations(false);
                        }}
                      >
                        {loc.display_name}
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          </div>

          {loading && <p style={{ padding: 10 }}>Loading reports...</p>}
          {error && <p style={{ padding: 10, color: "red" }}>{error}</p>}

          {/* METRICS */}
          {!loading && metrics && (
            <div className="reports-cards">
              <MetricCard label="Total Petitions" value={metrics.totalPetitions} icon="📄" />
              <MetricCard label="Resolved" value={metrics.resolved} icon="✅" />
              <MetricCard label="Pending" value={metrics.pending} icon="⏳" />
              <MetricCard label="Total Signatures" value={metrics.totalSignatures} icon="👥" />
              <MetricCard label="Total Votes" value={metrics.totalVotes} icon="🗳️" />
            </div>
          )}

          {/* CHARTS */}
          {!loading && (
            <div className="reports-charts">
              <ChartBar title="📊 Petition Status Distribution" data={statusDistribution} />
              <ChartBar title="📁 Petitions by Category (coming soon)" data={categoryDistribution} />
            </div>
          )}

          <div className="chart-card">
            <h4>📈 Monthly Trends (coming soon)</h4>
            <ResponsiveContainer width="100%" height={280}>
              <LineChart data={monthlyTrends}>
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line dataKey="petitions" stroke="#2563eb" strokeWidth={2} />
                <Line dataKey="signatures" stroke="#22c55e" strokeWidth={2} />
                <Line dataKey="votes" stroke="#7c3aed" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </main>
      </div>
    </div>
  );
}

/* REUSABLE COMPONENTS */
function MetricCard({ label, value, icon }) {
  return (
    <div className="metric-card">
      <div className="metric-icon">{icon}</div>
      <strong>{value}</strong>
      <span>{label}</span>
    </div>
  );
}

function ChartBar({ title, data }) {
  return (
    <div className="chart-card">
      <h4>{title}</h4>
      <ResponsiveContainer width="100%" height={240}>
        <BarChart data={Array.isArray(data) ? data : []}>
          <XAxis dataKey="name" />
          <YAxis allowDecimals={false} />
          <Tooltip />
          <Bar dataKey="value" radius={[6, 6, 0, 0]}>
            {(Array.isArray(data) ? data : []).map((_, i) => (
              <Cell key={i} fill={BAR_COLORS[i % BAR_COLORS.length]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
      {(!data || data.length === 0) && (
        <p style={{ fontSize: 13, color: "#6b7280", marginTop: 10 }}>
          No data available
        </p>
      )}
    </div>
  );
}
