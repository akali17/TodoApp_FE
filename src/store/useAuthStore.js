import { create } from "zustand";
import { loginApi, registerApi, googleLoginApi, getUserInfoApi } from "../api/auth";
import { initSocket, disconnectSocket } from "../socket";
import { useOnlineStore } from "./useOnlineStore";

export const useAuthStore = create((set) => ({
  user: null,
  token: localStorage.getItem("token") || null,
  loading: false,
  error: null,
  pendingEmail: null,

  // =====================
  // SET USER (for cached token)
  // =====================
  setUser: (user) => {
    set({ user });
    // Also persist to localStorage when user is updated
    localStorage.setItem("user", JSON.stringify(user));
  },

  // =====================
  // FETCH USER INFO (restore user from token)
  // =====================
  fetchUserInfo: async () => {
    try {
      const res = await getUserInfoApi();
      if (res.data.user) {
        set({ user: res.data.user });
        localStorage.setItem("user", JSON.stringify(res.data.user));
      }
    } catch (err) {
      console.error("Failed to fetch user info:", err);
      set({ user: null });
    }
  },

  // =====================
  // LOGIN
  // =====================
  login: async (email, password) => {
    try {
      set({ loading: true, error: null });

      const res = await loginApi(email, password);
      const { token, user } = res.data;

      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));

      // INIT SOCKET
      const socket = initSocket(token);

      // LISTEN ONLINE USERS
      socket.on("online-users", (users) => {
        useOnlineStore.getState().setOnlineUsers(users);
      });

      set({ user, token, loading: false });
      return true;
    } catch (err) {
      const errorMessage = err.response?.data?.message || "Login failed";
      const errorCode = err.response?.data?.code;
      
      // Store pending email for verification if needed
      if (errorCode === "EMAIL_NOT_VERIFIED" && err.response?.data?.email) {
        set({ 
          loading: false,
          error: errorMessage,
          pendingEmail: err.response.data.email
        });
      } else {
        set({
          loading: false,
          error: errorMessage,
        });
      }
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
      localStorage.setItem("user", JSON.stringify(user));

      const socket = initSocket(token);

      socket.on("online-users", (users) => {
        useOnlineStore.getState().setOnlineUsers(users);
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
    localStorage.removeItem("user");
    set({ user: null, token: null });
    useOnlineStore.getState().setOnlineUsers([]);
  },
}));
