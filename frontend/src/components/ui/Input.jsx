// src/components/ui/Input.jsx
import React from 'react';

export default function Input({ label, id, type='text', register, error, ...rest }) {
  return (
    <div className="cv-field">
      {label && <label htmlFor={id} className="cv-label">{label}</label>}
      <input id={id} type={type} className={`cv-input ${error ? 'cv-input-error' : ''}`} {...register} {...rest} />
      {error && <p className="cv-error">{error.message}</p>}
    </div>
  );
}
