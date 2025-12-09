// src/utils/validators.js
export const emailPattern = {
  value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  message: 'Enter a valid email'
};

export const minPassword = {
  value: 6,
  message: 'Password must be at least 6 characters'
};
