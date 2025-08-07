import express from "express";
import dotenv from "dotenv";
import http from "http";
import { Server } from "socket.io";
import Redis from "./Utils/redisClient.js";
import cors from "cors";
import bodyParser from "body-parser";
import Routes from "./Routes/authRoutes.js";
import { ConnectDB } from "./Config/db.js";

dotenv.config();
const app = express();

app.use(
  cors({
    origin: "https://code-rush-two.vercel.app/auth/login",
    credentials: true,
  })
);

app.use(bodyParser.json());

app.get("/", (req, res) => {
  res.send(" Server Running");
});

app.use("/api", Routes);

ConnectDB();

const rooms = {};

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "https://code-rush-two.vercel.app/auth/login",
    methods: ["GET", "POST"],
    credentials: true,
  },
  connectionStateRecovery: {
    maxDisconnectionDuration: 2 * 60 * 1000,
    skipMiddlewares: true,
  },
});

//  Track session hosts: { sessionId: socketId }
const sessionHosts = {};
const userNames = {};

io.on("connection", (socket) => {
  console.log(` Client connected: ${socket.id}`);

  socket.on("joinRoom", async (sessionId) => {
    if (!sessionId) return;
    socket.join(sessionId);
    console.log(` ${socket.id} joined room: ${sessionId}`);

    // Assign first user as host
    if (!sessionHosts[sessionId]) {
      sessionHosts[sessionId] = socket.id;
      console.log(` ${socket.id} set as host for ${sessionId}`);
    }

    if (!rooms[sessionId]) {
      rooms[sessionId] = [];
    }

    if (!rooms[sessionId].includes(socket.id)) {
      rooms[sessionId].push(socket.id);
    }

    // Send list of collaborators to everyone except the first user
    io.to(sessionId).emit("collaborators-update", {
      collaborators: rooms[sessionId],
    });

    // Notify user of their role
    const isHost = sessionHosts[sessionId] === socket.id;
    socket.emit("role-assigned", { isHost });

    //  Assign a temporary username
    const name = `User-${socket.id.slice(0, 4)}`;
    userNames[socket.id] = name;
    socket.emit("your-name", name);

    //  Load tree from Redis
    try {
      const stored = await Redis.get(`${sessionId}:structure`);
      if (stored) {
        socket.emit("treeStructure", {
          structure: JSON.parse(stored),
          expanded: true,
        });
      }
    } catch (err) {
      console.error(" Redis error in joinRoom:", err);
    }
  });

  socket.on("folder-structure", async ({ structure, sessionId, expanded }) => {
    try {
      await Redis.set(`${sessionId}:structure`, JSON.stringify(structure));
      io.to(sessionId).emit("treeStructure", { structure, expanded });
      console.log(" Folder structure updated and broadcasted");
    } catch (err) {
      console.error(" Error saving structure to Redis:", err);
    }
  });

  socket.on("fileOpened", async ({ file, sessionId, to }) => {
    try {
      await Redis.set(
        `${sessionId}:activeFile:${file.path}`,
        JSON.stringify(file)
      );
      if (to) {
        io.to(to).emit("fileOpened", { file });
      } else {
        io.to(sessionId).emit("fileOpened", { file });
      }
    } catch (err) {
      console.error(" Error storing opened file:", err);
    }
  });

  //  Chat message
  socket.on("chat-message", ({ sessionId, message }) => {
    const sender = userNames[socket.id] || "Anonymous";
    io.to(sessionId).emit("chat-message", { message, sender });
  });

  //files exchange setup
  socket.on("fileUpdated", async ({ file, sessionId }) => {
    try {
      await Redis.set(
        `${sessionId}:activeFile:${file.path}`,
        JSON.stringify(file)
      );
      io.to(sessionId).emit("fileUpdated", { file });
    } catch (err) {
      console.error(" Error updating file content:", err);
    }
  });

  socket.on("request-file", ({ path, sessionId }) => {
    const hostId = sessionHosts[sessionId];
    if (!hostId) return;
    if (hostId === socket.id) return;

    console.log(` File requested: ${path} → Host ${hostId}`);
    io.to(hostId).emit("request-file", { path, requesterId: socket.id });
  });

  socket.on("file-response", ({ file, sessionId, to }) => {
    if (!to) return;
    io.to(sessionId).emit("fileOpened", { file });
  });

  //voice call  setup

  socket.on("call-user", ({ to, from, offer }) => {
    io.to(to).emit("incoming-call", { from, offer });
  });

  socket.on("accept-call", ({ to, from, answer }) => {
    io.to(to).emit("call-accepted", { from, answer });
  });

  socket.on("reject-call", ({ to, from }) => {
    io.to(to).emit("call-rejected", { from });
  });

  socket.on("ice-candidate", ({ to, candidate }) => {
    io.to(to).emit("ice-candidate", candidate);
  });

  socket.on("call-ended", () => {
    socket.broadcast.emit("call-ended");
  });

  socket.on("disconnect", () => {
    console.log(` Client disconnected: ${socket.id}`);

    delete userNames[socket.id];

    // Clean up host if disconnected
    for (const sessionId in sessionHosts) {
      if (sessionHosts[sessionId] === socket.id) {
        console.log(` Host ${socket.id} left session ${sessionId}`);
        delete sessionHosts[sessionId];

        const remainingSockets = Object.keys(
          io.sockets.adapter.rooms.get(sessionId) || {}
        );
        if (remainingSockets.length > 0) {
          sessionHosts[sessionId] = remainingSockets[0];
          console.log(
            ` New host for session ${sessionId}: ${sessionHosts[sessionId]}`
          );
          io.to(sessionId).emit("role-assigned", { isHost: true });
        }
      }
    }
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(` Server running at http://localhost:${PORT}`);
});
