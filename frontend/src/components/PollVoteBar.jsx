import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";

const COLORS = ["#2563eb", "#7c3aed", "#22c55e", "#f59e0b"];

export default function PollVoteBar({ options = [] }) {
  // ✅ Guard: backend may send empty or undefined options
  if (!Array.isArray(options) || options.length === 0) {
    return (
      <p style={{ fontSize: 13, color: "#6b7280", textAlign: "center" }}>
        No votes available yet
      </p>
    );
  }

  const totalVotes = options.reduce(
    (sum, o) => sum + (Number(o.votes) || 0),
    0
  );

  const chartData = options.map((option, index) => {
    const votes = Number(option.votes) || 0;

    return {
      name:
        option.text && option.text.length > 18
          ? option.text.slice(0, 18) + "..."
          : option.text || "Option",
      fullName: option.text || "Option",
      votes,
      percentage:
        totalVotes > 0 ? Math.round((votes / totalVotes) * 100) : 0,
      fill: COLORS[index % COLORS.length],
    };
  });

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div
          style={{
            background: "#fff",
            border: "1px solid #e5e7eb",
            borderRadius: 8,
            padding: "8px 12px",
            fontSize: 13,
          }}
        >
          <strong>{data.fullName}</strong>
          <div>
            {data.votes} votes ({data.percentage}%)
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <>
      {/* ===== BAR CHART ===== */}
      <div style={{ height: 280, width: "100%" }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={chartData}
            layout="vertical"
            margin={{ top: 10, right: 30, left: 20, bottom: 10 }}
          >
            <XAxis type="number" />
            <YAxis
              type="category"
              dataKey="name"
              width={130}
              tick={{ fontSize: 12 }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Bar dataKey="votes" radius={[0, 6, 6, 0]}>
              {chartData.map((entry, index) => (
                <Cell key={index} fill={entry.fill} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* ===== GAP ===== */}
      <div style={{ height: 20 }} />

      {/* ===== RESULT LIST ===== */}
      {chartData.map((o, i) => (
        <div key={i} className="pd-result">
          <div className="pd-result-header">
            <span>{o.fullName}</span>
            <span>
              {o.votes} ({o.percentage}%)
            </span>
          </div>

          <div className="pd-bar">
            <div
              style={{
                width: `${o.percentage}%`,
                backgroundColor: o.fill,
              }}
            />
          </div>
        </div>
      ))}
    </>
  );
}
