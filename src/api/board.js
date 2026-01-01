import axiosClient from "./axiosClient";
const BASE_URL = `${import.meta.env.VITE_API_URL || "http://localhost:5000/api"}/boards`;

export const getMyBoards = (token) =>
  axiosClient.get(BASE_URL, {
    headers: { Authorization: `Bearer ${token}` },
  });

export const createBoardApi = (title, description, token) =>
  axiosClient.post(
    BASE_URL,
    { title, description },
    { headers: { Authorization: `Bearer ${token}` } }
  );
export const deleteBoardApi = (boardId, token) =>
  axiosClient.delete(`${BASE_URL}/${boardId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });

export const leaveBoardApi = (boardId, token) =>
  axiosClient.post(`${BASE_URL}/${boardId}/leave`, {}, {
    headers: { Authorization: `Bearer ${token}` },
  });