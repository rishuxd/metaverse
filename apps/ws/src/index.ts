import { WebSocketServer } from "ws";
import express from "express";
import cors from "cors";
import { User } from "./user";
import { RoomManager } from "./services/roomManager";
import { config } from "./config/constants";

// WebSocket Server
const wss = new WebSocketServer({ port: config.wsPort });

wss.on("connection", (ws) => {
  const user = new User(ws);

  ws.on("error", (error) => {
    console.error("WebSocket error:", error);
  });

  ws.on("close", () => {
    user.destroy();
  });
});

console.log(`✅ WebSocket Server running on port ${config.wsPort}`);

// HTTP Server for room info
const app = express();

app.use(cors({
  origin: config.corsOrigins,
  credentials: true,
}));

app.use(express.json());

// Health check
app.get("/health", (req, res) => {
  res.json({
    status: "ok",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

// Room info endpoint
app.get("/rooms/:spaceId/users", (req, res) => {
  const { spaceId } = req.params;
  const roomManager = RoomManager.getInstance();

  res.json({
    success: true,
    data: {
      spaceId,
      userCount: roomManager.getRoomUserCount(spaceId),
      users: roomManager.getActiveUsersInRoom(spaceId),
    },
  });
});

const httpServer = app.listen(config.httpPort, () => {
  console.log(`✅ Room Info Server running on port ${config.httpPort}`);
});

// Graceful shutdown
function shutdown(signal: string): void {
  console.log(`\n🛑 ${signal} received. Shutting down...`);

  wss.close(() => {
    console.log("✅ WebSocket server closed");
  });

  httpServer.close(() => {
    console.log("✅ HTTP server closed");
    process.exit(0);
  });

  // Force shutdown after 10s
  setTimeout(() => {
    console.error("⚠️  Forced shutdown after timeout");
    process.exit(1);
  }, 10000);
}

process.on("SIGINT", () => shutdown("SIGINT"));
process.on("SIGTERM", () => shutdown("SIGTERM"));

// Handle uncaught errors
process.on("uncaughtException", (error) => {
  console.error("❌ Uncaught Exception:", error);
  process.exit(1);
});

process.on("unhandledRejection", (reason, promise) => {
  console.error("❌ Unhandled Rejection at:", promise, "reason:", reason);
  process.exit(1);
});
