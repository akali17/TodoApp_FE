import { io } from "socket.io-client";

const SOCKET_URL = "http://localhost:5000";

let socket = null;

export const initSocket = (token) => {
  if (socket?.connected) {
    return socket;
  }

  socket = io(SOCKET_URL, {
    auth: { token },
    reconnection: true,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 5000,
    reconnectionAttempts: 5,
  });

  socket.on("connect", () => {
  });

  socket.on("disconnect", () => {
  });

  socket.on("connect_error", (err) => {
    console.error("❌ Socket connect error:", err);
  });

  return socket;
};

export const getSocket = () => socket;

// Wait for socket to be connected (max timeout: 5000ms)
export const waitForSocket = (timeout = 5000) => {
  return new Promise((resolve) => {
    const startTime = Date.now();
    
    const checkSocket = setInterval(() => {
      if (socket && socket.connected) {
        clearInterval(checkSocket);
        resolve(socket);
      } else if (Date.now() - startTime > timeout) {
        clearInterval(checkSocket);
        console.error("⏱️ Socket connection timeout");
        resolve(null);
      }
    }, 100);
  });
};

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};
