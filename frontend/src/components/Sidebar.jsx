// src/components/Sidebar.jsx
import React from 'react';
import ProfileCard from './ProfileCard';

function Item({children, active}) {
  return <div className={`sb-item ${active ? 'active' : ''}`}>{children}</div>;
}

export default function Sidebar(){
  return (
    <div className="sb-root">
      {/* <div style={{padding: '18px 20px'}}>
        <div className="sb-title">Civix</div>
      </div> */}
      {/* Profile card moved inside the sidebar */}
      <div style={{ padding: '0 16px 12px 16px' }}>
        <ProfileCard />
      </div>

      <div className="sb-items">
        <Item>🏠 Dashboard</Item>
        <Item>📝 Petitions</Item>
        <Item>📊 Polls</Item>
        <Item>👥 Officials</Item>
        <Item>📈 Reports</Item>
        <Item>⚙️ Settings</Item>
      </div>

      <div className="sb-footer">
        <div className="sb-help">❓ Help & Support</div>
      </div>
    </div>
  );
}
