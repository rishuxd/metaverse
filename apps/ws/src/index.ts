import { WebSocketServer } from "ws";
import { User } from "./user";

console.log("Starting server on port 5001 ;)");
const wss = new WebSocketServer({ port: 5001 });

wss.on("connection", function connection(ws) {
  console.log("User connected!");
  let user = new User(ws);
  ws.on("error", console.error);

  ws.on("close", () => {
    user?.destroy();
  });
});
