import axios from "axios";
const BASE_URL = "http://localhost:5000/api/boards";

export const getMyBoards = (token) =>
  axios.get(BASE_URL, {
    headers: { Authorization: `Bearer ${token}` },
  });

export const createBoardApi = (title, token) =>
  axios.post(
    BASE_URL,
    { title },
    { headers: { Authorization: `Bearer ${token}` } }
  );
