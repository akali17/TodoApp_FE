import { create } from "zustand";
import { loginApi, registerApi, googleLoginApi } from "../api/auth";

export const useAuthStore = create((set) => ({
  user: null,
  token: localStorage.getItem("token") || null,
  loading: false,
  error: null,

  // LOGIN
  login: async (email, password) => {
    try {
      set({ loading: true, error: null });
      const res = await loginApi(email, password);

      localStorage.setItem("token", res.data.token);

      set({
        user: res.data.user,
        token: res.data.token,
        loading: false,
      });

      return true;
    } catch (err) {
      set({
        loading: false,
        error: err.response?.data?.message || "Login failed",
      });
      return false;
    }
  },

  // REGISTER
  register: async (username, email, password) => {
    try {
      set({ loading: true, error: null });

      const res = await registerApi(username, email, password);

      return true; // đăng ký xong quay về login
    } catch (err) {
      set({
        loading: false,
        error: err.response?.data?.message || "Register failed",
      });
      return false;
    }
  },

  // GOOGLE LOGIN
  googleLogin: async (googleToken) => {
    try {
      set({ loading: true, error: null });

      const res = await googleLoginApi(googleToken);

      localStorage.setItem("token", res.data.token);

      set({
        user: res.data.user,
        token: res.data.token,
        loading: false,
      });

      return true;
    } catch (err) {
      set({ loading: false, error: "Google login failed" });
      return false;
    }
  },

 logout: () => {
  localStorage.removeItem("token");
  set({ user: null, token: null });
}
}));
