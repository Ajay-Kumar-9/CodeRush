// socket.ts
import { io, Socket } from "socket.io-client";

let socket: Socket | null = null;

export const getSocket = (): Socket => {
  if (!socket) {
    const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

    socket = io(`${BACKEND_URL}`, {
      transports: ["websocket"],
      autoConnect: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });
  }
  return socket;
};
