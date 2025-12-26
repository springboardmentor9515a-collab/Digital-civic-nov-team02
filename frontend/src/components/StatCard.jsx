import React from "react";

export default function StatCard({ title, value, subtitle, type }) {
  return (
    <div className="sc-card">
      <div className={`sc-icon-box ${type}`}>
        📊
      </div>

      <div className="sc-body">
        <span className="sc-title">{title}</span>
        <div className="sc-value">{value}</div>
        <div className="sc-sub">{subtitle}</div>
      </div>
    </div>
  );
}
