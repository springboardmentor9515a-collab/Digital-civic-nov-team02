import http from "./http";

// Create petition
export const createPetitionApi = (data) => {
  return http.post("/petitions", data);
};

// Get all petitions (used later)
export const getPetitionsApi = (params = {}) => {
  return http.get("/petitions", { params });
};
