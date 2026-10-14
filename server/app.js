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
app.use(bodyParser.json());

app.use(cors());

app.get("/", (req, res) => {
  res.send(" Server Running");
});

app.use("/api", Routes);

ConnectDB();

const rooms = {};

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
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

// Redis save helper: kabhi crash ya broadcast block nahi karega
const safeRedisSet = async (key, value, label) => {
  try {
    await Redis.set(key, value);
  } catch (err) {
    console.error(` Redis error (${label}):`, err.message);
  }
};

io.on("connection", (socket) => {
  console.log("User connected with socket id : ", socket.id);

  socket.on("joinRoom", async (sessionId) => {
    if (!sessionId) return;
    socket.join(sessionId);

    // Assign first user as host
    if (!sessionHosts[sessionId]) {
      sessionHosts[sessionId] = socket.id;
    }

    if (!rooms[sessionId]) {
      rooms[sessionId] = [];
    }

    if (!rooms[sessionId].includes(socket.id)) {
      rooms[sessionId].push(socket.id);
    }

    // Send list of collaborators to everyone in the room
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
      console.error(" Redis error in joinRoom:", err.message);
    }
  });

  // Folder tree: pehle broadcast, phir Redis mein save
  socket.on("folder-structure", async ({ structure, sessionId, expanded }) => {
    if (!sessionId) return;
    io.to(sessionId).emit("treeStructure", { structure, expanded });
    await safeRedisSet(
      `${sessionId}:structure`,
      JSON.stringify(structure),
      "folder-structure",
    );
  });

  // File open: pehle broadcast, phir Redis mein save
  socket.on("fileOpened", async ({ file, sessionId, to }) => {
    if (!file?.path) return;

    if (to) {
      io.to(to).emit("fileOpened", { file });
    } else if (sessionId) {
      socket.to(sessionId).emit("fileOpened", { file });
    }

    if (sessionId) {
      await safeRedisSet(
        `${sessionId}:activeFile:${file.path}`,
        JSON.stringify(file),
        "fileOpened",
      );
    }
  });

  //  Chat message
  socket.on("chat-message", ({ sessionId, message }) => {
    const sender = userNames[socket.id] || "Anonymous";
    io.to(sessionId).emit("chat-message", { message, sender });
  });

  // Live code changes: sender ko wapas nahi bhejna, baaki sabko turant bhejna
  socket.on("fileUpdated", async ({ file, sessionId }) => {
    if (!file?.path || !sessionId) return;

    socket.to(sessionId).emit("fileUpdated", { file });

    await safeRedisSet(
      `${sessionId}:activeFile:${file.path}`,
      JSON.stringify(file),
      "fileUpdated",
    );
  });

  socket.on("request-file", ({ path, sessionId }) => {
    const hostId = sessionHosts[sessionId];
    if (!hostId) return;
    if (hostId === socket.id) return;

    io.to(hostId).emit("request-file", { path, requesterId: socket.id });
  });

  // Host ka jawab sirf requester ko jayega, poore room ko nahi
  socket.on("file-response", ({ file, to }) => {
    if (!to || !file) return;
    io.to(to).emit("fileOpened", { file });
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

    // Collaborators list se purani socket id hatao
    for (const sessionId in rooms) {
      if (rooms[sessionId].includes(socket.id)) {
        rooms[sessionId] = rooms[sessionId].filter((id) => id !== socket.id);

        if (rooms[sessionId].length === 0) {
          delete rooms[sessionId];
        } else {
          io.to(sessionId).emit("collaborators-update", {
            collaborators: rooms[sessionId],
          });
        }
      }
    }

    // Clean up host if disconnected
    for (const sessionId in sessionHosts) {
      if (sessionHosts[sessionId] === socket.id) {
        delete sessionHosts[sessionId];

        const remainingSockets = Array.from(
          io.sockets.adapter.rooms.get(sessionId) || [],
        );
        if (remainingSockets.length > 0) {
          const newHostId = remainingSockets[0];
          sessionHosts[sessionId] = newHostId;

          // Sirf naye host ko batao, poore room ko nahi
          io.to(newHostId).emit("role-assigned", { isHost: true });
        }
      }
    }
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(` Server running at http://localhost:${PORT}`);
});