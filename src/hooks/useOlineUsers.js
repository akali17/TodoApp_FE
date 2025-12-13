import { useEffect, useState } from "react";
import { getSocket } from "../socket/socket";

export default function useOnlineUsers(boardId) {
  const [onlineUsers, setOnlineUsers] = useState([]);

  useEffect(() => {
    const socket = getSocket();
    if (!socket || !boardId) return;

    // join board room
    socket.emit("join-board", boardId);

    socket.on("board-online-users", (users) => {
      setOnlineUsers(users); // [{ userId, username }]
    });

    return () => {
      socket.emit("leave-board", boardId);
      socket.off("board-online-users");
    };
  }, [boardId]);

  return onlineUsers;
}
