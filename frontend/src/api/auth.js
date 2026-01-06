import http from "./http";

// Register user
export async function registerApi(payload) {
  const res = await http.post("/auth/register", payload);
  return res.data;
}

// Login user
export async function loginApi(payload) {
  const res = await http.post("/auth/login", payload);
  return res.data;
}

// Get current logged-in user
export async function meApi(token) {
  const res = await http.get("/auth/me", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return res.data;
}

// Logout user (frontend-side logout)
export async function logoutApi() {
  // If backend logout API exists later, call it here
  // For now, just resolve successfully
  return Promise.resolve(true);
}
