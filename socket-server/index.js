// File: socket-server/index.js

const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");

const app = express();
const server = http.createServer(app);

const SOCKET_SERVER_SECRET = process.env.SOCKET_SERVER_SECRET || "pesengo_socket_secret_2026";
const PORT = parseInt(process.env.PORT || "3001", 10);

const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST", "PATCH", "PUT", "DELETE"],
  },
  transports: ["websocket", "polling"],
});

app.use(cors());
app.use(express.json());

// Health check endpoint
app.get("/", (_req, res) => {
  res.json({
    status: "ok",
    service: "PesenGo Socket Server",
    connections: io.engine.clientsCount,
    uptime: process.uptime(),
  });
});

// Health check for Railway
app.get("/health", (_req, res) => {
  res.json({ status: "healthy" });
});

// Emit endpoint - called by Vercel API routes to broadcast events
app.post("/emit", (req, res) => {
  const authHeader = req.headers.authorization;
  const expectedToken = `Bearer ${SOCKET_SERVER_SECRET}`;

  if (!authHeader || authHeader !== expectedToken) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const { event, data } = req.body;

  if (!event) {
    return res.status(400).json({ error: "Event name is required" });
  }

  io.emit(event, data);

  return res.json({
    success: true,
    event,
    connections: io.engine.clientsCount,
  });
});

// Socket.IO connection handling
io.on("connection", (socket) => {
  console.log(`Client connected: ${socket.id}`);

  socket.on("join_room", (room) => {
    socket.join(room);
    console.log(`Socket ${socket.id} joined room: ${room}`);
  });

  socket.on("disconnect", () => {
    console.log(`Client disconnected: ${socket.id}`);
  });
});

server.listen(PORT, () => {
  console.log(`> PesenGo Socket Server running on port ${PORT}`);
  console.log(`> Real-time Socket.IO Gateway Ready`);
});
