import React, { useEffect, useState } from "react";
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

export default function Reports() {
  const { user } = useAuth();

  /* FILTERS */
  const [range, setRange] = useState("This Month");
  const [location, setLocation] = useState("");
  const [locationResults, setLocationResults] = useState([]);
  const [showLocations, setShowLocations] = useState(false);

  /* REPORT DATA (BACKEND DRIVEN) */
  const [metrics, setMetrics] = useState(null);
  const [statusDistribution, setStatusDistribution] = useState([]);
  const [categoryDistribution, setCategoryDistribution] = useState([]);
  const [monthlyTrends, setMonthlyTrends] = useState([]);

  const [loading, setLoading] = useState(true);

  /* FETCH REPORTS FROM BACKEND */
  useEffect(() => {
    async function fetchReports() {
      try {
        setLoading(true);

        const res = await fetch(
          `/api/reports?range=${encodeURIComponent(range)}&location=${encodeURIComponent(location)}`
        );

        if (!res.ok) {
          throw new Error("Failed to fetch reports");
        }

        const data = await res.json();

        setMetrics(data.metrics || null);
        setStatusDistribution(data.statusDistribution || []);
        setCategoryDistribution(data.categoryDistribution || []);
        setMonthlyTrends(data.monthlyTrends || []);
      } catch (err) {
        console.error(err);
        setMetrics(null);
        setStatusDistribution([]);
        setCategoryDistribution([]);
        setMonthlyTrends([]);
      } finally {
        setLoading(false);
      }
    }

    fetchReports();
  }, [range, location]);

  /* LEAFLET (NOMINATIM) LOCATION SEARCH */
  const searchLocation = async (query) => {
    if (!query) return;

    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${query}`
      );
      const data = await res.json();
      setLocationResults(data);
      setShowLocations(true);
    } catch (err) {
      console.error("Location search failed", err);
    }
  };

  /* EXPORT CSV (BACKEND DATA) */
  const exportCSV = () => {
    if (!metrics) return;

    const rows = [
      ["Metric", "Value"],
      ["Total Petitions", metrics.totalPetitions],
      ["Resolved", metrics.resolved],
      ["Pending", metrics.pending],
      ["Total Signatures", metrics.totalSignatures],
      ["Total Votes", metrics.totalVotes],
    ];

    const csv = rows.map((r) => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = "reports.csv";
    a.click();
  };

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
            </div>

            {user?.role === "official" && (
              <button className="export-btn" onClick={exportCSV} disabled={!metrics}>
                ⬇ Download CSV
              </button>
            )}
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
                placeholder="Search location"
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

          {/* METRICS */}
          {metrics && (
            <div className="reports-cards">
              <MetricCard label="Total Petitions" value={metrics.totalPetitions} icon="📄" />
              <MetricCard label="Resolved" value={metrics.resolved} icon="✅" />
              <MetricCard label="Pending" value={metrics.pending} icon="⏳" />
              <MetricCard label="Total Signatures" value={metrics.totalSignatures} icon="👥" />
              <MetricCard label="Total Votes" value={metrics.totalVotes} icon="🗳️" />
            </div>
          )}

          {/* CHARTS */}
          <div className="reports-charts">
            <ChartBar title="📊 Petition Status Distribution" data={statusDistribution} />
            <ChartBar title="📁 Petitions by Category" data={categoryDistribution} />
          </div>

          <div className="chart-card">
            <h4>📈 Monthly Trends</h4>
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
        <BarChart data={data}>
          <XAxis dataKey="name" />
          <YAxis allowDecimals={false} />
          <Tooltip />
          <Bar dataKey="value" radius={[6, 6, 0, 0]}>
            {data.map((_, i) => (
              <Cell key={i} fill={BAR_COLORS[i % BAR_COLORS.length]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
