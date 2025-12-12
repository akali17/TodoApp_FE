import axios from "axios";

const API = "http://localhost:5000/api/auth";

export const loginApi = (email, password) =>
  axios.post(`${API}/login`, { email, password });

export const registerApi = (username, email, password) =>
  axios.post(`${API}/register`, { username, email, password });

export const googleLoginApi = (token) =>
  axios.post(`${API}/google`, { token });
