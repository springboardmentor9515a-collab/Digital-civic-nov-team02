// import React, { useState } from "react";
// import { useAuth } from "../context/AuthProvider";
// import Topbar from "../components/Topbar";
// import Sidebar from "../components/Sidebar";
// import StatCard from "../components/StatCard";
// import FilterChips from "../components/FilterChips";
// import PetitionsEmpty from "../components/PetitionsEmpty";
// import CreatePetitionModal from "../pages/CreatePetition"; // ✅ FIX
// import "../styles/dashboard.css";

// export default function Dashboard() {
//   const { user } = useAuth();
//   const [showCreate, setShowCreate] = useState(false);

//   const getGreeting = () => {
//     const hour = new Date().getHours();
//     if (hour >= 5 && hour < 12) return "GOOD MORNING";
//     if (hour >= 12 && hour < 17) return "GOOD AFTERNOON";
//     if (hour >= 17 && hour < 21) return "GOOD EVENING";
//     return "GOOD NIGHT";
//   };

//   const stats = [
//     { title: "My Petitions", value: 0, subtitle: "petitions", type: "blue" },
//     {
//       title: "Successful Petitions",
//       value: 0,
//       subtitle: "or under review",
//       type: "green",
//     },
//     { title: "Polls Created", value: 0, subtitle: "polls", type: "purple" },
//   ];

//   return (
//     <div className="app-layout">
//       <Sidebar />

//       <div className="app-main">
//         <Topbar />

//         <main className="app-content">
//           <div className="db-hero">
//             <div className="db-welcome">
//               <div>
//                 <span className="db-greeting">✨ {getGreeting()}</span>
//                 <h2>Welcome back, {user?.name || "User"}!</h2>
//                 <p>
//                   See what's happening in your community and make your voice heard.
//                 </p>
//               </div>

//               <button
//                 className="db-primary-btn"
//                 onClick={() => setShowCreate(true)}
//               >
//                 Create Petition
//               </button>
//             </div>
//           </div>

//           <div className="db-stats-row">
//             {stats.map((s, idx) => (
//               <StatCard key={idx} {...s} />
//             ))}
//           </div>

//           <section className="db-section">
//             <div className="db-section-head">
//               <h3>Active Petitions Near You</h3>
//               <div className="db-location">
//                 <span>📍</span>
//                 {user?.location || "Your Location"}
//               </div>
//             </div>

//             <FilterChips />
//             <PetitionsEmpty />
//           </section>
//         </main>
//       </div>

//       {/* ✅ MODAL */}
//       {showCreate && (
//         <CreatePetitionModal onClose={() => setShowCreate(false)} />
//       )}
//     </div>
//   );
// }


import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthProvider";
import api from "../api/http"; 
import Topbar from "../components/Topbar";
import Sidebar from "../components/Sidebar";
import StatCard from "../components/StatCard";
import PetitionsEmpty from "../components/PetitionsEmpty";
import CreatePetitionModal from "../pages/CreatePetition";
import "../styles/dashboard.css";

// ✅ 1. INTERNAL CARD COMPONENT (So you don't need an external file)
const DashboardPetitionCard = ({ petition }) => (
  <div style={{
    background: "white",
    border: "1px solid #e5e7eb",
    borderRadius: "12px",
    padding: "20px",
    display: "flex",
    flexDirection: "column",
    gap: "12px",
    boxShadow: "0 2px 4px rgba(0,0,0,0.05)"
  }}>
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start" }}>
      <span style={{ 
        fontSize: "12px", 
        fontWeight: "600", 
        color: "#4F46E5", 
        background: "#EEF2FF", 
        padding: "4px 12px", 
        borderRadius: "20px" 
      }}>
        {petition.category}
      </span>
      <span style={{ fontSize: "12px", color: petition.status === "active" ? "green" : "gray" }}>
        ● {petition.status}
      </span>
    </div>

    <h3 style={{ margin: "0", fontSize: "18px", fontWeight: "700", color: "#111827" }}>
      {petition.title}
    </h3>

    <p style={{ margin: "0", fontSize: "14px", color: "#6B7280", lineHeight: "1.5" }}>
      {petition.description.length > 80 
        ? petition.description.substring(0, 80) + "..." 
        : petition.description}
    </p>

    <div style={{ fontSize: "13px", color: "#6B7280", display: "flex", alignItems: "center", gap: "6px" }}>
      <span>📍</span> {petition.location}
    </div>

    <div style={{ marginTop: "auto", paddingTop: "12px", borderTop: "1px solid #f3f4f6" }}>
      <div style={{ display: "flex", justifyContent: "space-between", fontSize: "13px", marginBottom: "6px" }}>
        <strong>{petition.signers.length} signed</strong>
        <span style={{ color: "#6B7280" }}>of {petition.goal} goal</span>
      </div>
      {/* Progress Bar */}
      <div style={{ width: "100%", height: "6px", background: "#E5E7EB", borderRadius: "10px", overflow: "hidden" }}>
        <div style={{ 
          width: `${Math.min((petition.signers.length / petition.goal) * 100, 100)}%`, 
          height: "100%", 
          background: "#4F46E5" 
        }} />
      </div>
    </div>
  </div>
);

export default function Dashboard() {
  const { user } = useAuth();
  const [showCreate, setShowCreate] = useState(false);
  const [petitions, setPetitions] = useState([]); 
  const [selectedCategory, setSelectedCategory] = useState("All"); 

  // ✅ 2. FETCH DATA
  useEffect(() => {
    const fetchPetitions = async () => {
      try {
        const res = await api.get("/petitions"); 
        setPetitions(res.data);
      } catch (err) {
        console.error("Error loading dashboard:", err);
      }
    };
    fetchPetitions();
  }, []);

  // ✅ 3. FILTER LOGIC
  const filteredPetitions = petitions.filter((p) => {
    if (selectedCategory === "All") return true;
    return p.category === selectedCategory;
  });

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "GOOD MORNING";
    if (hour < 17) return "GOOD AFTERNOON";
    return "GOOD EVENING";
  };

  const stats = [
    { title: "My Petitions", value: petitions.filter(p => p.creator?._id === user?._id).length, subtitle: "active", type: "blue" },
    { title: "Total Active", value: petitions.length, subtitle: "community", type: "green" },
    { title: "Polls Created", value: 0, subtitle: "polls", type: "purple" },
  ];

  const categories = ["All", "Infrastructure", "Education", "Public Safety", "Environment", "Transportation"];

  return (
    <div className="app-layout">
      <Sidebar />
      <div className="app-main">
        <Topbar />
        <main className="app-content">
          
          <div className="db-hero">
            <div className="db-welcome">
              <div>
                <span className="db-greeting">✨ {getGreeting()}</span>
                <h2>Welcome back, {user?.name || "User"}!</h2>
                <p>See what's happening in your community.</p>
              </div>
              <button className="db-primary-btn" onClick={() => setShowCreate(true)}>
                Create Petition
              </button>
            </div>
          </div>

          <div className="db-stats-row">
            {stats.map((s, idx) => <StatCard key={idx} {...s} />)}
          </div>

          <section className="db-section">
            <div className="db-section-head">
              <h3>Active Petitions</h3>
            </div>

            {/* ✅ FILTER BUTTONS */}
            <div className="filter-row" style={{ display: 'flex', gap: '10px', marginBottom: '20px', flexWrap: 'wrap' }}>
              {categories.map(cat => (
                <button 
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  style={{
                    padding: '8px 16px',
                    borderRadius: '20px',
                    border: 'none',
                    cursor: 'pointer',
                    fontWeight: '500',
                    backgroundColor: selectedCategory === cat ? '#4F46E5' : '#E5E7EB',
                    color: selectedCategory === cat ? 'white' : '#374151',
                    transition: 'all 0.2s'
                  }}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* ✅ DISPLAY CARDS */}
            {filteredPetitions.length > 0 ? (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
                {filteredPetitions.map((petition) => (
                  <DashboardPetitionCard key={petition._id} petition={petition} />
                ))}
              </div>
            ) : (
              <PetitionsEmpty />
            )}
            
          </section>
        </main>
      </div>

      {showCreate && <CreatePetitionModal onClose={() => setShowCreate(false)} />}
    </div>
  );
}