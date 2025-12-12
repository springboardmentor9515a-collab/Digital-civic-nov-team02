// src/components/AuthHeader.jsx
import React from 'react';
import LogoSmall from '../assets/logo-small.png'; // <-- put your logo here

export default function AuthHeader({
  title = 'Welcome to Civix',
  subtitle = 'Join our platform to make your voice heard in local governance.'
}) {
  return (
    <div className="di-auth-header-wrap">
      <div className="di-auth-header">
        <img src={LogoSmall} alt="Civix logo" className="di-auth-logo" />
        <div className="di-auth-texts">
          <div className="di-auth-title-small">{title}</div>
          <div className="di-auth-sub-small">{subtitle}</div>
        </div>
      </div>
    </div>
  );
}
