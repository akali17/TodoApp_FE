import { useEffect } from "react";
import { getSocket } from "../socket";
import { useOnlineStore } from "../store/useOnlineStore";

export default function useOnlineUsers() {
  const { onlineUsers, setOnlineUsers } = useOnlineStore();

  useEffect(() => {
    const socket = getSocket();
    if (!socket) return;

    const handleOnlineUsers = (users) => {
      console.log("📡 Received online-users:", users);
      setOnlineUsers(users); // Update global store
    };

    socket.on("online-users", handleOnlineUsers);

    return () => {
      socket.off("online-users", handleOnlineUsers);
    };
  }, [setOnlineUsers]);

  return onlineUsers;
}
