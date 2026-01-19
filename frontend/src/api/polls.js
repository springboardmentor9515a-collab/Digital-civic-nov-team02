import http from "./http";

/**
 * Create a new poll (Official only)
 */
export const createPoll = (data) => {
  return http.post("/polls", data);
};

/**
 * Get polls based on user location
 */
export const getPolls = () => {
  return http.get("/polls");
};

/**
 * Get poll details + results
 */
export const getPollById = (id) => {
  return http.get(`/polls/${id}`);
};

/**
 * Vote on a poll (Citizen only)
 */
export const votePoll = (id, selectedOption) => {
  return http.post(`/polls/${id}/vote`, { selectedOption });
}; 
