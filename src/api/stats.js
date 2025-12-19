import axiosClient from "./axiosClient";

const STATS_BASE = "/stats";

export const getBoardStats = () => axiosClient.get(`${STATS_BASE}/board-stats`);

export const getActivityStats = () =>
  axiosClient.get(`${STATS_BASE}/activity-stats`);

export const getAllCardsWithDeadlines = () =>
  axiosClient.get(`${STATS_BASE}/cards-with-deadlines`);
