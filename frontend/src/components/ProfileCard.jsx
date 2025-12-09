// src/components/ProfileCard.jsx
import React from 'react';

/*
  Minimal dynamic ProfileCard:
  - reads user object from localStorage (key "user")
  - expects something like: { name, role, location, email, id }
  - if none is present, shows blank / subtle placeholder
*/
export default function ProfileCard(){
  let user = null;
  try {
    const raw = localStorage.getItem('user');
    if (raw) user = JSON.parse(raw);
  } catch (e) {
    user = null;
  }

  // safe fallback values (empty strings so UI is subtle)
  const name = user?.name || '';
  const role = user?.role || '';
  const location = user?.location || '';
  const email = user?.email || '';
  const id = user?.id || '';

  const avatarLetter = name ? name.charAt(0).toUpperCase() : '';

  return (
    <div className="pc-root-sidebar">
      <div className="pc-left">
        <div className="pc-avatar-sidebar">{avatarLetter}</div>
      </div>

      <div className="pc-right-sidebar">
        <div className="pc-name-sidebar">{name}</div>
        <div className="pc-role-sidebar">{role}</div>
        <div className="pc-loc-sidebar">{location}</div>
        <div className="pc-email-sidebar">{id ? `${id} · ${email}` : ''}</div>
      </div>
    </div>
  );
}
