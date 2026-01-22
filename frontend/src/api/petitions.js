import http from "./http";

/*
  Backend routes are mounted at /api/petitions
  baseURL already includes /api
*/

export const getPetitionsApi = (filters) => {
  return http.get("/petitions", { params: filters });
};

export const createPetitionApi = (data) => {
  return http.post("/petitions", data);
};

export const getSinglePetitionApi = (id) => {
  return http.get(`/petitions/${id}`);
};

export const deletePetitionApi = (id) => {
  return http.delete(`/petitions/${id}`);
};

export const editPetitionApi = (id, data) => {
  return http.put(`/petitions/${id}`, data);
};

export const signPetitionApi = (id) => {
  return http.post(`/petitions/${id}/sign`);
};

// ✅ Milestone-2: Officials view local petitions
export const getLocalPetitionsApi = () => {
  return http.get("/petitions/local");
};

/* Future endpoints (keep if your project uses them later) */
export const getPetitionSignaturesApi = (id) => {
  return http.get(`/petitions/${id}/signatures`);
};

export const getUserPetitionsApi = (userId) => {
  return http.get(`/users/${userId}/petitions`);
};
export const getUserSignedPetitionsApi = (userId) => {
  return http.get(`/users/${userId}/signed-petitions`);
};
export const getUserCreatedPetitionsApi = (userId) => {
  return http.get(`/users/${userId}/created-petitions`);
};
export const getTrendingPetitionsApi = () => {
  return http.get(`/petitions/trending`);
};
export const getRecentPetitionsApi = () => {
  return http.get(`/petitions/recent`);
};
export const getMostSignedPetitionsApi = () => {
  return http.get(`/petitions/most-signed`);
};
export const getClosingSoonPetitionsApi = () => {
  return http.get(`/petitions/closing-soon`);
};
export const getFeaturedPetitionsApi = () => {
  return http.get(`/petitions/featured`);
};
