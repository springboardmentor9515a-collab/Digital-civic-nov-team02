// src/api/auth.js
import http from "./http";

/*
  These functions assume:
  - Backend sets HttpOnly cookie on successful login/register
  - OR backend returns { token, user }
*/

export async function registerApi(payload) {
  // payload: { name, email, password, role, location... }
  const res = await http.post("/api/auth/register", payload);
  return res.data;
}

export async function loginApi(payload) {
  // payload: { email, password }
  const res = await http.post("/api/auth/login", payload);
  return res.data;
}

export async function meApi() {
  const res = await http.get("/api/auth/me");
  return res.data;
}

export async function logoutApi() {
  const res = await http.post("/api/auth/logout");
  return res.data;
}
