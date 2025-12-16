import { useEffect } from "react";
import { Navigate } from "react-router-dom";
import { useAuthStore } from "../store/useAuthStore";
import { initSocket } from "../socket";
import { useOnlineStore } from "../store/useOnlineStore";

export default function ProtectedRoute({ children }) {
  const token = useAuthStore((state) => state.token);

  useEffect(() => {
    // If user has token, ensure socket is initialized
    if (token) {
      const socket = initSocket(token);
      
      // Setup online users listener
      socket.on("online-users", (users) => {
        useOnlineStore.getState().setOnlineUsers(users);
      });
      
      console.log("✅ Socket initialized for protected route");
    }
  }, [token]);

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  return children;
}
