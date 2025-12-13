import { create } from "zustand";
import { loginApi, registerApi, googleLoginApi } from "../api/auth";
import { initSocket, disconnectSocket } from "../socket/socket";
import { useOnlineStore } from "./useOnlineStore";

export const useAuthStore = create((set) => ({
  user: null,
  token: localStorage.getItem("token") || null,
  loading: false,
  error: null,

  // =====================
  // LOGIN
  // =====================
  login: async (email, password) => {
    try {
      set({ loading: true, error: null });

      const res = await loginApi(email, password);
      const { token, user } = res.data;

      localStorage.setItem("token", token);

      // INIT SOCKET
      const socket = initSocket(token);

      socket.on("online-users", (users) => {
        useOnlineStore.getState().setOnlineUsers(users);
      });

      socket.on("user-online", (userId) => {
        useOnlineStore.getState().addOnlineUser(userId);
      });

      socket.on("user-offline", (userId) => {
        useOnlineStore.getState().removeOnlineUser(userId);
      });

      set({ user, token, loading: false });

      return true;
    } catch (err) {
      set({
        loading: false,
        error: err.response?.data?.message || "Login failed",
      });
      return false;
    }
  },

  // =====================
  // REGISTER
  // =====================
  register: async (username, email, password) => {
    try {
      set({ loading: true, error: null });
      await registerApi(username, email, password);
      set({ loading: false });
      return true;
    } catch (err) {
      set({
        loading: false,
        error: err.response?.data?.message || "Register failed",
      });
      return false;
    }
  },

  // =====================
  // GOOGLE LOGIN
  // =====================
  googleLogin: async (googleToken) => {
    try {
      set({ loading: true, error: null });

      const res = await googleLoginApi(googleToken);
      const { token, user } = res.data;

      localStorage.setItem("token", token);

      const socket = initSocket(token);

      socket.on("online-users", (users) => {
        useOnlineStore.getState().setOnlineUsers(users);
      });

      socket.on("user-online", (userId) => {
        useOnlineStore.getState().addOnlineUser(userId);
      });

      socket.on("user-offline", (userId) => {
        useOnlineStore.getState().removeOnlineUser(userId);
      });

      set({ user, token, loading: false });
      return true;
    } catch (err) {
      set({ loading: false, error: "Google login failed" });
      return false;
    }
  },

  // =====================
  // LOGOUT
  // =====================
  logout: () => {
    disconnectSocket();
    localStorage.removeItem("token");
    set({ user: null, token: null });
    useOnlineStore.getState().setOnlineUsers([]);
  },
}));
