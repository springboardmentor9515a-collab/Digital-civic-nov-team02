// src/components/IconInput.jsx
import React from 'react';

export default function IconInput({
  id,
  label,
  type = 'text',
  icon,
  register,
  error,
  placeholder = '',
  ...rest
}) {
  return (
    <div className="di-field">
      {label && <label htmlFor={id} className="di-label">{label}</label>}
      <div className={`di-input-wrap ${error ? 'di-error' : ''}`}>
        <input
          id={id}
          type={type}
          placeholder={placeholder}
          className="di-input"
          {...(register || {})}
          {...rest}
        />
        {icon && <span className="di-icon" aria-hidden>{icon}</span>}
      </div>
      {error && <div className="di-field-error">{error.message || error}</div>}
    </div>
  );
}
