// src/components/StatCard.jsx
import React from 'react';

export default function StatCard({ title, value, subtitle }){
  return (
    <div className="sc-card">
      <div className="sc-head">
        <div className="sc-title">{title}</div>
        <div className="sc-icon">📄</div>
      </div>

      <div className="sc-body">
        <div className="sc-value">{value}</div>
        <div className="sc-sub">{subtitle}</div>
      </div>
    </div>
  );
}
