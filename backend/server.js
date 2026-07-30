require("dotenv").config();
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const compression = require("compression");
const morgan = require("morgan");
const rateLimit = require("express-rate-limit");
const mongoSanitize = require("express-mongo-sanitize");
const http = require("http");
const { Server } = require("socket.io");
const Y = require("yjs");
const { validateEnv } = require("./config/validateEnv");
const connectDB = require("./config/db");
const { startDailyReminderJob } = require("./utils/dailyReminder");

const authRoutes = require("./routes/authRoutes");
const questionRoutes = require("./routes/questionRoutes");
const judgeRoutes = require("./routes/judgeRoutes");
const analyticsRoutes = require("./routes/analyticsRoutes");
const leaderboardRoutes = require("./routes/leaderboardRoutes");
const scheduledInterviewRoutes = require("./routes/scheduledInterviewRoutes");
const publicRoutes = require("./routes/publicRoutes");
const aptitudeRoutes = require("./routes/aptitudeRoutes");
const resumeRoutes = require("./routes/resumeRoutes");
const debateRoutes = require("./routes/debateRoutes");
const behavioralRoutes = require("./routes/behavioralRoutes");
const situationalRoutes = require("./routes/situationalRoutes");
const architectureRoutes = require("./routes/architectureRoutes");

validateEnv(); // fail fast with a clear message if config is missing/insecure
connectDB();
startDailyReminderJob();

const app = express();

// Behind a reverse proxy (Render, Railway, Heroku, etc.) this makes
// req.ip / rate limiting see the real client IP instead of the proxy's.
app.set("trust proxy", 1);

app.use(helmet()); // sets a solid set of security headers by default
app.use(compression()); // gzip responses
app.use(cors({ origin: process.env.CLIENT_URL || "*" }));
app.use(express.json({ limit: "1mb" })); // cap request body size
app.use(mongoSanitize()); // strips $/. operators from user input to prevent NoSQL injection

if (process.env.NODE_ENV !== "test") {
  app.use(morgan(process.env.NODE_ENV === "production" ? "combined" : "dev"));
}

// General API rate limit — generous, just guards against runaway abuse
const generalLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 500, standardHeaders: true, legacyHeaders: false });
app.use("/api", generalLimiter);

// Stricter limit on auth endpoints specifically — the classic brute-force target
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: "Too many attempts from this IP, please try again in a few minutes." },
});
app.use("/api/auth/login", authLimiter);
app.use("/api/auth/register", authLimiter);
app.use("/api/auth/forgot-password", authLimiter);

app.get("/", (req, res) => res.json({ message: "InterviewOS API is running" }));
app.get("/api/health", (req, res) => {
  const mongoose = require("mongoose");
  res.json({
    status: "ok",
    uptime: process.uptime(),
    dbConnected: mongoose.connection.readyState === 1,
    timestamp: new Date().toISOString(),
  });
});

app.use("/api/auth", authRoutes);
app.use("/api/questions", questionRoutes);
app.use("/api/judge", judgeRoutes);
app.use("/api/analytics", analyticsRoutes);
app.use("/api/leaderboard", leaderboardRoutes);
app.use("/api/scheduled-interviews", scheduledInterviewRoutes);
app.use("/api/public", publicRoutes);
app.use("/api/aptitude", aptitudeRoutes);
app.use("/api/resume", resumeRoutes);
app.use("/api/debate", debateRoutes);
app.use("/api/behavioral", behavioralRoutes);
app.use("/api/situational", situationalRoutes);
app.use("/api/architecture", architectureRoutes);

// 404 + error handling
app.use((req, res) => res.status(404).json({ message: "Route not found" }));
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ message: "Server error" });
});

const server = http.createServer(app);

// ---------------------------------------------------------------------
// Socket.io: Real-time collaborative DSA practice rooms
// ---------------------------------------------------------------------
const io = new Server(server, { cors: { origin: process.env.CLIENT_URL || "*" } });

// In-memory room state: { [roomId]: { ydoc: Y.Doc, users: Set, whiteboard: [], shapes: [], connectors: [] } }
const rooms = {};

// -------------------------------------------------------------------
// Live Multiplayer Peer-to-Peer Mock Interviews — Elo-based matchmaking
// queue (chess.com-style). In-memory, single-server scope; fine for a
// project like this, would need a shared store (e.g. Redis) to scale
// across multiple server instances.
// -------------------------------------------------------------------
const matchmakingQueue = []; // [{ socketId, userId, name, eloRating, queuedAt }]
const ELO_MATCH_RANGE = 200; // prefer opponents within this many Elo points
const MAX_WAIT_MS = 15000; // after this long, widen the match to anyone waiting

function toBase64(u8) { return Buffer.from(u8).toString("base64"); }
function fromBase64(b64) { return new Uint8Array(Buffer.from(b64, "base64")); }

function getOrCreateRoom(roomId) {
  if (!rooms[roomId]) {
    const ydoc = new Y.Doc();
    ydoc.getText("code").insert(0, "// Start coding together...\n");
    rooms[roomId] = { ydoc, users: {}, whiteboard: [], shapes: [], connectors: [] };
  }
  return rooms[roomId];
}

io.on("connection", (socket) => {
  // -------------------------------------------------------------------
  // Multiplayer matchmaking — pairs two queued users (roughly by Elo),
  // assigns one as "interviewer" and one as "candidate", and creates a
  // shared room for them (reuses the existing collab room + video call
  // infrastructure above).
  // -------------------------------------------------------------------
  socket.on("join-matchmaking", ({ userId, name, eloRating }) => {
    socket.data.matchmaking = { userId, name, eloRating };

    // Try to find a compatible opponent already waiting
    const now = Date.now();
    let opponentIndex = matchmakingQueue.findIndex((q) => {
      const withinRange = Math.abs(q.eloRating - eloRating) <= ELO_MATCH_RANGE;
      const waitedLongEnough = now - q.queuedAt > MAX_WAIT_MS;
      return q.userId !== userId && (withinRange || waitedLongEnough);
    });

    if (opponentIndex === -1) {
      matchmakingQueue.push({ socketId: socket.id, userId, name, eloRating, queuedAt: now });
      socket.emit("matchmaking-status", { status: "waiting", queueSize: matchmakingQueue.length });
      return;
    }

    const opponent = matchmakingQueue.splice(opponentIndex, 1)[0];
    const roomId = `match-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    const iAmInterviewer = Math.random() < 0.5;

    socket.emit("match-found", {
      roomId,
      role: iAmInterviewer ? "interviewer" : "candidate",
      opponentName: opponent.name,
      opponentElo: opponent.eloRating,
    });
    io.to(opponent.socketId).emit("match-found", {
      roomId,
      role: iAmInterviewer ? "candidate" : "interviewer",
      opponentName: name,
      opponentElo: eloRating,
    });
  });

  socket.on("leave-matchmaking", () => {
    const idx = matchmakingQueue.findIndex((q) => q.socketId === socket.id);
    if (idx !== -1) matchmakingQueue.splice(idx, 1);
  });

  socket.on("join-room", ({ roomId, userName }) => {
    socket.join(roomId);
    socket.data.roomId = roomId;
    socket.data.userName = userName;

    const room = getOrCreateRoom(roomId);
    room.users[socket.id] = userName;

    // Send current room state to the newly joined user — the full Yjs
    // document state (CRDT) plus whiteboard/shapes.
    socket.emit("room-state", {
      yjsState: toBase64(Y.encodeStateAsUpdate(room.ydoc)),
      whiteboard: room.whiteboard,
      shapes: room.shapes,
      connectors: room.connectors,
    });

    io.to(roomId).emit("user-list", Object.values(room.users));
    socket.to(roomId).emit("system-message", `${userName} joined the room`);
    // Let existing peers know a new user is ready for a WebRTC connection
    socket.to(roomId).emit("peer-joined", { socketId: socket.id, userName });
  });

  // -------------------------------------------------------------------
  // Real-time Collaborative Code Editor — CRDT (Yjs) based sync.
  // The server holds the authoritative Y.Doc per room; each client sends
  // its local update (a compact binary diff), the server applies it and
  // relays the SAME update to every other client. This merges concurrent
  // edits correctly (unlike naive "broadcast the whole string" sync).
  // -------------------------------------------------------------------
  socket.on("yjs-update", ({ roomId, update }) => {
    const room = rooms[roomId];
    if (!room) return;
    try {
      Y.applyUpdate(room.ydoc, fromBase64(update));
    } catch (e) {
      return; // ignore malformed updates rather than crashing the room
    }
    socket.to(roomId).emit("yjs-update", update);
  });

  socket.on("cursor-move", ({ roomId, userName, position }) => {
    socket.to(roomId).emit("cursor-update", { userName, position });
  });

  socket.on("chat-message", ({ roomId, userName, message }) => {
    io.to(roomId).emit("chat-message", { userName, message, timestamp: Date.now() });
  });

  // -------------------------------------------------------------------
  // System Design Whiteboard — freehand strokes + AWS/Azure-style shapes
  // synced to the room. Lightweight custom canvas sync (no external
  // whiteboard library required); state is stored so late joiners see
  // the full board.
  // -------------------------------------------------------------------
  socket.on("whiteboard-draw", ({ roomId, stroke }) => {
    if (rooms[roomId]) rooms[roomId].whiteboard.push(stroke);
    socket.to(roomId).emit("whiteboard-draw", stroke);
  });

  socket.on("whiteboard-clear", ({ roomId }) => {
    if (rooms[roomId]) { rooms[roomId].whiteboard = []; rooms[roomId].shapes = []; rooms[roomId].connectors = []; }
    io.to(roomId).emit("whiteboard-clear");
  });

  socket.on("whiteboard-shape", ({ roomId, shape }) => {
    if (rooms[roomId]) rooms[roomId].shapes.push(shape);
    socket.to(roomId).emit("whiteboard-shape", shape);
  });

  socket.on("whiteboard-shape-move", ({ roomId, id, x, y }) => {
    if (rooms[roomId]) {
      const s = rooms[roomId].shapes.find((sh) => sh.id === id);
      if (s) { s.x = x; s.y = y; }
    }
    socket.to(roomId).emit("whiteboard-shape-move", { id, x, y });
  });

  // Straight-line arrow connectors between two shapes (system design flow)
  socket.on("whiteboard-connector", ({ roomId, connector }) => {
    if (rooms[roomId]) rooms[roomId].connectors.push(connector);
    socket.to(roomId).emit("whiteboard-connector", connector);
  });

  // -------------------------------------------------------------------
  // WebRTC signaling relay for peer-to-peer audio/video in the Interview
  // Room. The server never touches media itself — it only relays the
  // SDP offer/answer and ICE candidates between the two browsers, which
  // then connect directly (peer-to-peer) using free public STUN servers.
  // -------------------------------------------------------------------
  socket.on("webrtc-offer", ({ roomId, targetSocketId, offer }) => {
    io.to(targetSocketId).emit("webrtc-offer", { fromSocketId: socket.id, offer });
  });
  socket.on("webrtc-answer", ({ targetSocketId, answer }) => {
    io.to(targetSocketId).emit("webrtc-answer", { fromSocketId: socket.id, answer });
  });
  socket.on("webrtc-ice-candidate", ({ targetSocketId, candidate }) => {
    io.to(targetSocketId).emit("webrtc-ice-candidate", { fromSocketId: socket.id, candidate });
  });

  socket.on("disconnect", () => {
    const mmIdx = matchmakingQueue.findIndex((q) => q.socketId === socket.id);
    if (mmIdx !== -1) matchmakingQueue.splice(mmIdx, 1);

    const { roomId, userName } = socket.data;
    if (roomId && rooms[roomId]) {
      delete rooms[roomId].users[socket.id];
      io.to(roomId).emit("user-list", Object.values(rooms[roomId].users));
      socket.to(roomId).emit("system-message", `${userName || "A user"} left the room`);
      socket.to(roomId).emit("peer-left", { socketId: socket.id });

      if (Object.keys(rooms[roomId].users).length === 0) {
        delete rooms[roomId]; // cleanup empty room
      }
    }
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`InterviewOS server running on port ${PORT}`));

// Graceful shutdown — important on platforms like Render/Railway/Heroku
// that send SIGTERM before restarting/redeploying a container. Without
// this, in-flight requests and DB connections can be cut off abruptly.
function gracefulShutdown(signal) {
  console.log(`\n${signal} received — shutting down gracefully...`);
  server.close(() => {
    console.log("HTTP server closed.");
    require("mongoose").connection.close(false).then(() => {
      console.log("MongoDB connection closed.");
      process.exit(0);
    });
  });
  // Force-exit if graceful shutdown takes too long
  setTimeout(() => process.exit(1), 10000).unref();
}

process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
process.on("SIGINT", () => gracefulShutdown("SIGINT"));
