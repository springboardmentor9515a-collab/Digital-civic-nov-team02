import React, { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";
import { getPetitionsApi, deletePetitionApi } from "../api/petitions";
import CreatePetitionModal from "../pages/CreatePetition";
import ViewPetitionModal from "../components/ViewPetitionModal";
import EditPetitionModal from "../components/EditPetitionModal";
import DeletePetitionModal from "../components/DeletePetitionModal";
import "../styles/petitions.css";

/* ✅ SAME helper used in ViewPetitionModal */
function getTimeAgo(dateString) {
  if (!dateString) return "Just now";

  const diff = Date.now() - new Date(dateString).getTime();
  const minutes = Math.floor(diff / 60000);

  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes} minute${minutes > 1 ? "s" : ""} ago`;

  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} hour${hours > 1 ? "s" : ""} ago`;

  const days = Math.floor(hours / 24);
  return `${days} day${days > 1 ? "s" : ""} ago`;
}

export default function Petitions() {
  const [petitions, setPetitions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("all");
  const [showCreate, setShowCreate] = useState(false);

  // ✅ Modal states
  const [selectedPetition, setSelectedPetition] = useState(null);
  const [showView, setShowView] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [showDelete, setShowDelete] = useState(false);

  const [filters, setFilters] = useState({
    location: "",
    category: "",
    status: "",
  });

  async function fetchPetitions() {
    setLoading(true);
    try {
      const res = await getPetitionsApi(filters);
      setPetitions(res.data || []);
    } catch {
      setPetitions([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchPetitions();
  }, [filters]);

  function handleChange(e) {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  }

  async function handleDeleteConfirm(id) {
    try {
      await deletePetitionApi(id);
      setShowDelete(false);
      setSelectedPetition(null);
      fetchPetitions();
    } catch (err) {
      alert("Failed to delete petition");
      console.error(err);
    }
  }

  return (
    <div className="app-layout">
      <Sidebar />
      <div className="app-main">
        <Topbar />

        <main className="app-content">
          {/* HEADER */}
          <div className="pt-header">
            <div>
              <h2>Petitions</h2>
              <p>Browse, sign, and track petitions in your community.</p>
            </div>

            <button className="pt-create-btn" onClick={() => setShowCreate(true)}>
              Create Petition
            </button>
          </div>

          {/* CONTROLS */}
          <div className="pt-controls">
            <div className="pt-tabs">
              {["all", "my", "signed"].map((tab) => (
                <button
                  key={tab}
                  className={`pt-tab ${activeTab === tab ? "active" : ""}`}
                  onClick={() => setActiveTab(tab)}
                >
                  {tab === "all"
                    ? "All Petitions"
                    : tab === "my"
                    ? "My Petitions"
                    : "Signed by Me"}
                </button>
              ))}
            </div>

            <div className="pt-filters">
              <select name="location" onChange={handleChange}>
                <option value="">All Locations</option>
              </select>

              <select name="category" onChange={handleChange}>
                <option value="">All Categories</option>
                <option value="Environment">Environment</option>
                <option value="Infrastructure">Infrastructure</option>
                <option value="Education">Education</option>
                <option value="Public Safety">Public Safety</option>
                <option value="Transportation">Transportation</option>
                <option value="Healthcare">Healthcare</option>
                <option value="Housing">Housing</option>
              </select>

              <select name="status" onChange={handleChange}>
                <option value="">Status: All</option>
                <option value="active">Active</option>
                <option value="under_review">Pending</option>
                <option value="closed">Closed</option>
              </select>
            </div>
          </div>

          {/* CONTENT */}
          {loading ? (
            <p className="pt-center">Loading...</p>
          ) : petitions.length === 0 ? (
            <p className="pt-center">No petitions found</p>
          ) : (
            <div className="pt-grid">
              {petitions.map((p) => (
                <div key={p._id} className="pt-card">
                  {/* ACTION ICONS */}
                  <div className="pt-card-actions">
                    <span
                      className="pt-icon edit"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedPetition(p);
                        setShowEdit(true);
                      }}
                      title="Edit"
                    >
                      ✏️
                    </span>

                    <span
                      className="pt-icon delete"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedPetition(p);
                        setShowDelete(true);
                      }}
                      title="Delete"
                    >
                      🗑️
                    </span>
                  </div>

                  <div className="pt-progress">
                    <span
                      style={{
                        width: `${Math.min(
                          ((p.signaturesCount || 0) / 100) * 100,
                          100
                        )}%`,
                      }}
                    />
                  </div>

                  {/* ✅ FIXED TIME */}
                  <div className="pt-time">
                    ⏱ {getTimeAgo(p.createdAt)}
                  </div>

                  <h3>{p.title}</h3>

                  <p className="pt-desc">
                    {p.description?.slice(0, 90)}...
                  </p>

                  <div className="pt-footer">
                    <span className="pt-count">
                      {p.signaturesCount || 0} of 100 signatures
                    </span>

                    <span className={`pt-status ${p.status || "active"}`}>
                      {p.status || "Active"}
                    </span>
                  </div>

                  <span
                    className="pt-link"
                    onClick={() => {
                      setSelectedPetition(p);
                      setShowView(true);
                    }}
                  >
                    View Details
                  </span>
                </div>
              ))}
            </div>
          )}
        </main>
      </div>

      {/* CREATE */}
      {showCreate && (
        <CreatePetitionModal onClose={() => setShowCreate(false)} />
      )}

      {/* VIEW */}
      {showView && selectedPetition && (
        <ViewPetitionModal
          petition={selectedPetition}
          open={showView}
          onOpenChange={setShowView}
        />
      )}

      {/* EDIT */}
      {showEdit && selectedPetition && (
        <EditPetitionModal
          petition={selectedPetition}
          open={showEdit}
          onOpenChange={setShowEdit}
          onSaved={fetchPetitions}
        />
      )}

      {/* DELETE */}
      {showDelete && selectedPetition && (
        <DeletePetitionModal
          petition={selectedPetition}
          open={showDelete}
          onClose={() => setShowDelete(false)}
          onConfirm={handleDeleteConfirm}
        />
      )}
    </div>
  );
}
