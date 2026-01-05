import { WebSocketServer } from "ws";
import { User } from "./user";
import express from "express";
import cors from "cors";
import { RoomManager } from "./roomManager";

console.log("Starting WebSocket server on port 5001");
const wss = new WebSocketServer({ port: 5001 });

wss.on("connection", function connection(ws) {
  let user = new User(ws);
  ws.on("error", console.error);

  ws.on("close", () => {
    user?.destroy();
  });
});

// HTTP server to expose room data
const app = express();
app.use(cors());

app.get("/rooms/:spaceId/users", (req, res) => {
  const { spaceId } = req.params;
  const roomManager = RoomManager.getInstance();
  const users = roomManager.getActiveUsersInRoom(spaceId);
  const userCount = roomManager.getRoomUserCount(spaceId);

  res.json({
    spaceId,
    userCount,
    users,
  });
});

app.listen(5002, () => {
  console.log("Room info HTTP server running on port 5002");
});
