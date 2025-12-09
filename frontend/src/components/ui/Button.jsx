// src/components/ui/Button.jsx
import React from 'react';

export default function Button({ children, className = '', ...props }) {
  return (
    <button
      {...props}
      className={`cv-btn ${className}`}
    >
      {children}
    </button>
  );
}
