// src/pages/Admin.jsx
import React, { useEffect, useMemo, useState } from "react";
import Topbar from "../components/Topbar";
import Sidebar from "../components/Sidebar";
import "../styles/dashboard.css"; // existing styles
import "../styles/admin.css";     // new admin-specific styles
import { useAuth } from "../context/AuthProvider";
import { Navigate } from "react-router-dom";

/*
  Admin page (fully functional UI)
  - Shows admin stats
  - Search + filter + pagination for local issues
  - Row actions: View, Assign (mock), Resolve (mock)
  - Minimal simulated async actions so it feels real
*/

const MOCK_ISSUES = [
  {
    id: "ISS-001",
    title: "Potholes on Main St",
    category: "Infrastructure",
    status: "open",
    votes: 42,
    location: "Sector 12",
    createdAt: "2025-11-01"
  },
  {
    id: "ISS-002",
    title: "Street light not working",
    category: "Public Safety",
    status: "in_progress",
    votes: 15,
    location: "Block B",
    createdAt: "2025-11-05"
  },
  {
    id: "ISS-003",
    title: "Overflowing garbage bin",
    category: "Environment",
    status: "open",
    votes: 27,
    location: "Park Ave",
    createdAt: "2025-10-28"
  },
  {
    id: "ISS-004",
    title: "Illegal construction noise",
    category: "Housing",
    status: "resolved",
    votes: 8,
    location: "MG Road",
    createdAt: "2025-09-18"
  },
  {
    id: "ISS-005",
    title: "Missing bus stop sign",
    category: "Transportation",
    status: "open",
    votes: 6,
    location: "Central Square",
    createdAt: "2025-11-08"
  },
  // add a few more so pagination looks real
  {
    id: "ISS-006", title: "Drain blockage", category: "Infrastructure", status: "open", votes: 13, location: "Lakeview", createdAt: "2025-11-02"
  },
  {
    id: "ISS-007", title: "Water leak", category: "Infrastructure", status: "in_progress", votes: 19, location: "North End", createdAt: "2025-10-30"
  },
  {
    id: "ISS-008", title: "Unsafe footpath", category: "Public Safety", status: "open", votes: 11, location: "Hilltop", createdAt: "2025-11-03"
  }
];

const STAT_MAP = [
  { key: "open", label: "Open Issues" },
  { key: "in_progress", label: "In Progress" },
  { key: "resolved", label: "Resolved" }
];

export default function Admin() {
  const { user, loading } = useAuth();
  const [issues, setIssues] = useState(MOCK_ISSUES);
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");
  const [page, setPage] = useState(1);
  const [perPage] = useState(5);
  const [actionLoading, setActionLoading] = useState(""); // id of row that's doing action
  const [toast, setToast] = useState(null);

  // guard: we expect role "official"
  if (!loading && !user) {
    // not logged in
    return <Navigate to="/login" replace />;
  }
  if (!loading && user && user.role !== "official") {
    // unauthorized
    return <Navigate to="/dashboard" replace />;
  }

  useEffect(() => {
    if (toast) {
      const t = setTimeout(() => setToast(null), 2800);
      return () => clearTimeout(t);
    }
  }, [toast]);

  const categories = useMemo(() => {
    const setC = new Set(issues.map(i => i.category));
    return ["All", ...Array.from(setC)];
  }, [issues]);

  const filtered = issues.filter(i => {
    if (query && !(`${i.title} ${i.id} ${i.location}`.toLowerCase().includes(query.toLowerCase()))) {
      return false;
    }
    if (category !== "All" && i.category !== category) return false;
    if (statusFilter !== "All" && i.status !== statusFilter) return false;
    return true;
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / perPage));
  const pageData = filtered.slice((page - 1) * perPage, page * perPage);

  function simulateApi(ms = 800) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  async function handleAssign(issueId) {
    setActionLoading(issueId);
    await simulateApi(900);
    // mock: mark as in_progress
    setIssues(prev => prev.map(it => it.id === issueId ? { ...it, status: "in_progress" } : it));
    setActionLoading("");
    setToast({ kind: "success", text: `Assigned ${issueId}` });
  }

  async function handleResolve(issueId) {
    setActionLoading(issueId);
    await simulateApi(900);
    setIssues(prev => prev.map(it => it.id === issueId ? { ...it, status: "resolved" } : it));
    setActionLoading("");
    setToast({ kind: "success", text: `Marked ${issueId} as resolved` });
  }

  function handleView(issue) {
    // simple modal replacement: alert for now (non-invasive)
    alert(`${issue.id}\n\n${issue.title}\n\nCategory: ${issue.category}\nStatus: ${issue.status}\nLocation: ${issue.location}\nVotes: ${issue.votes}\nCreated: ${issue.createdAt}`);
  }

  function handleDelete(issueId) {
    if (!confirm("Delete this issue from list? (This is local demo only)")) return;
    setIssues(prev => prev.filter(p => p.id !== issueId));
    setToast({ kind: "info", text: `Deleted ${issueId}` });
  }

  function resetFilters() {
    setQuery("");
    setCategory("All");
    setStatusFilter("All");
    setPage(1);
  }

  return (
    <div className="db-root">
      <Topbar />
      <div className="db-body">
        <aside className="db-sidebar">
          <Sidebar />
        </aside>

        <main className="db-main admin-main">
          <div className="admin-header">
            <div className="admin-title">
              <h1>Official Admin Console</h1>
              <p className="muted">Manage petitions and local issues in your jurisdiction</p>
            </div>

            <div className="admin-actions">
              <div className="stat-row">
                {STAT_MAP.map(s => {
                  const count = issues.filter(i => i.status === s.key).length;
                  return (
                    <div key={s.key} className="admin-stat">
                      <div className="stat-value">{count}</div>
                      <div className="stat-label">{s.label}</div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          <section className="admin-controls">
            <div className="search-row">
              <input
                placeholder="Search by title / id / location..."
                value={query}
                onChange={(e) => { setQuery(e.target.value); setPage(1); }}
                className="admin-input"
              />
              <select className="admin-select" value={category} onChange={e => { setCategory(e.target.value); setPage(1); }}>
                {categories.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
              <select className="admin-select" value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setPage(1); }}>
                <option value="All">All statuses</option>
                <option value="open">Open</option>
                <option value="in_progress">In Progress</option>
                <option value="resolved">Resolved</option>
              </select>

              <button className="admin-btn" onClick={() => resetFilters()}>Reset</button>
            </div>
          </section>

          <section className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Title</th>
                  <th>Category</th>
                  <th>Location</th>
                  <th>Votes</th>
                  <th>Status</th>
                  <th>Created</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {pageData.length === 0 && (
                  <tr>
                    <td colSpan="8" style={{ textAlign: "center", padding: 28, color: "#666" }}>
                      No issues found — adjust filters or add mock data.
                    </td>
                  </tr>
                )}

                {pageData.map(issue => (
                  <tr key={issue.id}>
                    <td className="mono">{issue.id}</td>
                    <td>{issue.title}</td>
                    <td>{issue.category}</td>
                    <td>{issue.location}</td>
                    <td className="mono">{issue.votes}</td>
                    <td>
                      <span className={`badge status-${issue.status}`}>{issue.status.replace("_", " ")}</span>
                    </td>
                    <td>{issue.createdAt}</td>
                    <td className="actions">
                      <button className="link-btn" onClick={() => handleView(issue)}>View</button>
                      {issue.status !== "in_progress" && issue.status !== "resolved" && (
                        <button className="action-btn" disabled={actionLoading === issue.id} onClick={() => handleAssign(issue.id)}>
                          {actionLoading === issue.id ? "..." : "Assign"}
                        </button>
                      )}
                      {issue.status !== "resolved" && (
                        <button className="action-btn" disabled={actionLoading === issue.id} onClick={() => handleResolve(issue.id)}>
                          {actionLoading === issue.id ? "..." : "Resolve"}
                        </button>
                      )}
                      <button className="danger-btn" onClick={() => handleDelete(issue.id)}>Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="admin-pager">
              <div>Showing {Math.min(filtered.length, (page - 1) * perPage + 1)} - {Math.min(filtered.length, page * perPage)} of {filtered.length}</div>
              <div className="pager-controls">
                <button className="pager-btn" onClick={() => setPage(1)} disabled={page === 1}>First</button>
                <button className="pager-btn" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}>Prev</button>
                <span className="pager-info">Page {page} / {totalPages}</span>
                <button className="pager-btn" onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}>Next</button>
                <button className="pager-btn" onClick={() => setPage(totalPages)} disabled={page === totalPages}>Last</button>
              </div>
            </div>
          </section>
        </main>
      </div>

      {/* toast */}
      {toast && (
        <div className={`admin-toast ${toast.kind === "success" ? "ok" : "info"}`}>
          {toast.text}
        </div>
      )}
    </div>
  );
}
