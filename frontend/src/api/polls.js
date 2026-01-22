import http from "./http";

export const createPoll = (data) => {
  return http.post("/polls", {
    title: data.question,
    options: data.options,
    targetLocation: data.location,
  });
};

export const getPolls = () => http.get("/polls");

export const getPollById = (id) => http.get(`/polls/${id}`);

export const votePoll = (id, optionIndex) =>
  http.post(`/polls/${id}/vote`, { optionIndex });
