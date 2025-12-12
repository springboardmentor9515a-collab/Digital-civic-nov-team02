// src/api/auth.js
import http from './http';

/*
  These functions assume:
  - Backend sets HttpOnly cookie on successful login/register when desired.
  - Alternatively backend returns { token, user } which frontend can store in localStorage.
*/

export async function registerApi(payload) {
  // payload: { name, email, password, role, location... }
  const res = await http.post('/auth/register', payload);
  return res.data;
}

export async function loginApi(payload) {
  // payload: { email, password }
  const res = await http.post('/auth/login', payload);
  return res.data;
}

export async function meApi() {
  const res = await http.get('/auth/me');
  return res.data;
}

export async function logoutApi() {
  // backend should clear cookie
  const res = await http.post('/auth/logout');
  return res.data;
}
