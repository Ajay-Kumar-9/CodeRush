// socket.ts
import { io, Socket } from "socket.io-client";

let socket: Socket | null = null;

export const getSocket = (): Socket => {
  if (!socket) {
    /*  socket = io(process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:5000', { */

    socket = io("https://coderush-tvf3.onrender.com", {
      transports: ["websocket"],
      autoConnect: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });
  }
  return socket;
};
