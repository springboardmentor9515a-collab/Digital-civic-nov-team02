// import http from "./http";

// // Register user
// export async function registerApi(payload) {
//   const res = await http.post("/auth/register", payload);
//   return res.data;
// }

// // Login user
// export async function loginApi(payload) {
//   const res = await http.post("/auth/login", payload);
//   return res.data;
// }

// // Get current logged-in user
// export async function meApi(token) {
//   const res = await http.get("/auth/me", {
//     headers: {
//       Authorization: `Bearer ${token}`
//     }
//   });
//   return res.data;
// }



// src/api/auth.js
import http from './http';

// Define the backend URL explicitly to avoid port errors
const API_URL = "http://localhost:5000/api";

/*
  These functions assume:
  - Backend sets HttpOnly cookie on successful login/register when desired.
  - Alternatively backend returns { token, user } which frontend can store in localStorage.
*/

export async function registerApi(payload) {
  // payload: { name, email, password, role, location... }
  // Sends request to: http://localhost:5000/api/auth/register
  const res = await http.post(`${API_URL}/auth/register`, payload);
  return res.data;
}

export async function loginApi(payload) {
  // payload: { email, password }
  // Sends request to: http://localhost:5000/api/auth/login
  const res = await http.post(`${API_URL}/auth/login`, payload);
  return res.data;
}

export async function meApi() {
  // Sends request to: http://localhost:5000/api/auth/me
  const res = await http.get(`${API_URL}/auth/me`);
  return res.data;
}

export async function logoutApi() {
  // backend should clear cookie
  // Sends request to: http://localhost:5000/api/auth/logout
  const res = await http.post(`${API_URL}/auth/logout`);
  return res.data;
}
