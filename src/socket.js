import { io } from "socket.io-client";

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || "http://localhost:5000";

let socket = null;

export const initSocket = (token) => {
  if (socket?.connected) {
    return socket;
  }

  if (!SOCKET_URL) {
    console.error("❌ Socket URL not configured");
    return null;
  }

  try {
    socket = io(SOCKET_URL, {
      auth: { token },
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: 5,
      timeout: 10000,
    });

    socket.on("connect", () => {
      // Socket connected
    });

    socket.on("disconnect", () => {
      // Socket disconnected
    });

    socket.on("connect_error", (err) => {
      console.error("❌ Socket connect error:", err.message);
    });

    socket.on("reconnect_failed", () => {
      console.error("❌ Socket reconnection failed after maximum attempts");
    });

    return socket;
  } catch (error) {
    console.error("❌ Failed to initialize socket:", error);
    return null;
  }
};

export const getSocket = () => socket;

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};

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
