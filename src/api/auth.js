import axios from "axios";
import axiosClient from "./axiosClient";

const API = "http://localhost:5000/api/users";

export const loginApi = (email, password) =>
  axios.post(`${API}/login`, { email, password });

export const registerApi = (username, email, password) =>
  axios.post(`${API}/register`, { username, email, password });

export const getUserInfoApi = () =>
  axiosClient.get(`${API}/me`);

export const googleLoginApi = (token) =>
  axios.post(`${API}/google`, { token });
