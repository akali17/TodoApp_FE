import { useEffect, useRef } from "react";
import { BrowserRouter } from "react-router-dom";
import AppRouter from "./router";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { useAuthStore } from "./store/useAuthStore";
import { initSocket } from "./socket";

export default function App() {
  const token = useAuthStore((state) => state.token);
  const user = useAuthStore((state) => state.user);
  const setUser = useAuthStore((state) => state.setUser);
  const fetchUserInfo = useAuthStore((state) => state.fetchUserInfo);
  const hasInitialized = useRef(false);

  useEffect(() => {
    // Only run once on app mount
    if (hasInitialized.current) return;
    hasInitialized.current = true;

    // Load user from localStorage on app start
    const cachedUser = localStorage.getItem("user");
    if (cachedUser) {
      try {
        setUser(JSON.parse(cachedUser));
      } catch (err) {
        console.error("Failed to parse cached user:", err);
      }
    }
    // If token exists but no user cached, fetch from API
    else if (token && !user) {
      fetchUserInfo();
    }
  }, []);

  useEffect(() => {
    // Initialize socket when token is available
    if (token) {
      initSocket(token);
    }
  }, [token]);

  return (
    <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}>
      <BrowserRouter>
        <AppRouter />
      </BrowserRouter>
    </GoogleOAuthProvider>
  );
}
