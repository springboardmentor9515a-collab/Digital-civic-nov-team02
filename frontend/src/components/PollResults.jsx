import { useState } from "react";
import PollVoteBar from "./PollVoteBar";
import PollVotePie from "./PollVotePie";

export default function PollResults({ options = [] }) {
  const [chartType, setChartType] = useState("bar");

  // ✅ Backend-safe total votes calculation
  const totalVotes = Array.isArray(options)
    ? options.reduce((sum, o) => sum + (Number(o.votes) || 0), 0)
    : 0;

  // ✅ Guard: no options yet (API loading or empty poll)
  if (!Array.isArray(options) || options.length === 0) {
    return (
      <div className="pd-card">
        <h3>Results</h3>
        <p
          style={{
            fontSize: 13,
            color: "#6b7280",
            textAlign: "center",
            marginTop: 16,
          }}
        >
          No results available yet
        </p>
      </div>
    );
  }

  return (
    <div className="pd-card">
      <h3>Results</h3>

      <div className="pd-toggle">
        <button
          className={chartType === "bar" ? "active" : ""}
          onClick={() => setChartType("bar")}
        >
          Bar Chart
        </button>
        <button
          className={chartType === "pie" ? "active" : ""}
          onClick={() => setChartType("pie")}
        >
          Pie Chart
        </button>
      </div>

      {/* 🔄 Toggle-based mount animation preserved */}
      {chartType === "bar" ? (
        <PollVoteBar options={options} />
      ) : (
        <PollVotePie options={options} totalVotes={totalVotes} />
      )}

      <div className="pd-total">
        Total votes: {totalVotes}
      </div>
    </div>
  );
}
