import { useEffect } from "react";
import { initSocket, disconnectSocket } from "../socket/socket";
import { useAuthStore } from "../store/useAuthStore";

export default function useSocket() {
  const token = useAuthStore((s) => s.token);

  useEffect(() => {
    if (!token) return;

    initSocket(token);

    return () => {
      disconnectSocket();
    };
  }, [token]);
}
