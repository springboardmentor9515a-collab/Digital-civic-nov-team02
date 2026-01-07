import http from "./http";
import axios from "axios";

/*
  IMPORTANT:
  Backend routes are mounted at /api/petitions
*/

export const getPetitionsApi = (filters) => {
  return http.get("/api/petitions", {
    params: filters,
  });
};

export const createPetitionApi = (data) => {
  return http.post("/api/petitions", data);
};

export const getSinglePetitionApi = (id) => {
  return http.get(`/api/petitions/${id}`);
};

export const deletePetitionApi = (id) => {
  return http.delete(`/api/petitions/${id}`);
};

export const editPetitionApi = (id, data) => {
  return http.put(`/api/petitions/${id}`, data);
};

export const signPetitionApi = (id) => {
  return http.post(`/api/petitions/${id}/sign`);
};
