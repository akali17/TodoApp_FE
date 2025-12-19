import axios from "axios";
const BASE_URL = `${import.meta.env.VITE_API_URL || "http://localhost:5000/api"}/boards`;

export const getMyBoards = (token) =>
  axios.get(BASE_URL, {
    headers: { Authorization: `Bearer ${token}` },
  });

export const createBoardApi = (title, description, token) =>
  axios.post(
    BASE_URL,
    { title, description },
    { headers: { Authorization: `Bearer ${token}` } }
  );
