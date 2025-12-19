import axios from "axios";

const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
console.log("API URL:", apiUrl); // debug

const axiosClient = axios.create({
  baseURL: apiUrl,
});

axiosClient.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
},
(error) => {
  return Promise.reject(error);
});

export default axiosClient;
