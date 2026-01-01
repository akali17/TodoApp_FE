import axios from "axios";
import axiosClient from "./axiosClient";

const API = `${import.meta.env.VITE_API_URL || "http://localhost:5000/api"}/users`;

export const loginApi = (email, password) =>
  axiosClient.post(`${API}/login`, { email, password });

export const registerApi = (username, email, password) =>
  axiosClient.post(`${API}/register`, { username, email, password });

export const getUserInfoApi = () =>
  axiosClient.get(`${API}/me`);

export const googleLoginApi = (token) =>
  axios.post(`${API}/google-login`, { token });
