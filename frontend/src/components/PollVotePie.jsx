import { useEffect, useState } from "react";

const COLORS = ["#2563eb", "#7c3aed", "#22c55e", "#f59e0b"];

export default function PollVotePie({ options = [], totalVotes = 0 }) {
  const [progress, setProgress] = useState(0);
  const [hovered, setHovered] = useState(null);
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });

  // ✅ Guard: backend may not have data yet
  if (!Array.isArray(options) || options.length === 0) {
    return (
      <p style={{ fontSize: 13, color: "#6b7280", textAlign: "center" }}>
        No votes available yet
      </p>
    );
  }

  // 🔁 Animate every mount
  useEffect(() => {
    setProgress(0);
    const t = requestAnimationFrame(() => setProgress(1));
    return () => cancelAnimationFrame(t);
  }, []);

  let cumulative = 0;

  return (
    <>
      {/* ===== DONUT PIE CHART ===== */}
      <div
        style={{
          position: "relative",
          display: "flex",
          justifyContent: "center",
          marginBottom: 24,
        }}
      >
        <svg
          width="220"
          height="220"
          viewBox="0 0 220 220"
          onMouseLeave={() => setHovered(null)}
        >
          <g transform="rotate(-90 110 110)">
            {options.map((o, i) => {
              const votes = Number(o.votes) || 0;
              const value =
                totalVotes > 0 ? votes / totalVotes : 0;

              const dash = value * 628;
              const offset = cumulative * 628;
              cumulative += value;

              return (
                <circle
                  key={o.id ?? i}
                  cx="110"
                  cy="110"
                  r="90"
                  fill="transparent"
                  stroke={COLORS[i % COLORS.length]}
                  strokeWidth="26"
                  strokeDasharray={`${dash * progress} ${628}`}
                  strokeDashoffset={-offset}
                  style={{
                    transition: "stroke-dasharray 0.9s ease-out",
                    cursor: "pointer",
                  }}
                  onMouseMove={(e) => {
                    const rect =
                      e.currentTarget.ownerSVGElement.getBoundingClientRect();
                    setTooltipPos({
                      x: e.clientX - rect.left,
                      y: e.clientY - rect.top,
                    });
                    setHovered({
                      text: o.text || "Option",
                      votes,
                      percent:
                        totalVotes > 0
                          ? Math.round((votes / totalVotes) * 100)
                          : 0,
                    });
                  }}
                />
              );
            })}
          </g>
        </svg>

        {/* ===== TOOLTIP ===== */}
        {hovered && (
          <div
            style={{
              position: "absolute",
              top: tooltipPos.y - 10,
              left: tooltipPos.x + 10,
              background: "#ffffff",
              border: "1px solid #e5e7eb",
              borderRadius: 10,
              padding: "10px 14px",
              fontSize: 13,
              boxShadow: "0 8px 24px rgba(0,0,0,0.12)",
              pointerEvents: "none",
              zIndex: 10,
              whiteSpace: "nowrap",
            }}
          >
            <div style={{ fontWeight: 600, color: "#111827" }}>
              {hovered.text}
            </div>
            <div style={{ color: "#6b7280", marginTop: 2 }}>
              {hovered.votes} votes ({hovered.percent}%)
            </div>
          </div>
        )}
      </div>

      {/* ===== LEGEND ===== */}
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          gap: 18,
          flexWrap: "wrap",
          marginBottom: 24,
          fontSize: 13,
          color: "#374151",
        }}
      >
        {options.map((o, i) => (
          <div
            key={`legend-${o.id ?? i}`}
            style={{ display: "flex", alignItems: "center", gap: 6 }}
          >
            <span
              style={{
                width: 10,
                height: 10,
                borderRadius: 3,
                backgroundColor: COLORS[i % COLORS.length],
                display: "inline-block",
              }}
            />
            <span>
              {o.text && o.text.length > 20
                ? o.text.slice(0, 20) + "..."
                : o.text || "Option"}
            </span>
          </div>
        ))}
      </div>

      {/* ===== DETAILED RESULT LIST ===== */}
      {options.map((o, i) => {
        const votes = Number(o.votes) || 0;
        const percent =
          totalVotes > 0
            ? Math.round((votes / totalVotes) * 100)
            : 0;

        return (
          <div key={o.id ?? i} className="pd-result">
            <div className="pd-result-header">
              <span>{o.text || "Option"}</span>
              <span>
                {votes} ({percent}%)
              </span>
            </div>

            <div className="pd-bar">
              <div
                style={{
                  width: `${percent}%`,
                  backgroundColor: COLORS[i % COLORS.length],
                }}
              />
            </div>
          </div>
        );
      })}
    </>
  );
}
