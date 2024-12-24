import { WebSocket } from "ws";
import { RoomManager } from "./roomManager";
import jwt, { JwtPayload } from "jsonwebtoken";
import { JWT_SECRET } from "./utils/config";
import client from "@repo/db/client";

export class User {
  public userId?: string;
  private spaceId?: string;
  private x: number;
  private y: number;
  private ws: WebSocket;

  constructor(ws: WebSocket) {
    this.x = 0;
    this.y = 0;
    this.ws = ws;
    this.init();
  }

  init() {
    this.ws.on("message", async (data) => {
      const parsedData = JSON.parse(data.toString());

      console.log("Received message", parsedData);

      switch (parsedData.type) {
        case "join":
          const spaceId = parsedData.payload.spaceId;
          const token = parsedData.payload.token;

          const space = await client.space.findUnique({
            where: {
              id: spaceId,
            },
          });

          if (!space) {
            this.ws.close();
            return;
          }

          const userId = (jwt.verify(token, JWT_SECRET) as JwtPayload).id;
          if (!userId) {
            this.ws.close();
            return;
          }

          this.userId = userId;
          this.spaceId = spaceId;

          RoomManager.getInstance().addUserToRoom(spaceId, this);

          // We need to get the right spawn point for the user based on the existing users and space elements
          this.x = Math.floor(Math.random() * space?.width);
          this.y = Math.floor(Math.random() * space?.height);

          this.send({
            type: "space-joined",
            payload: {
              spawn: {
                x: this.x,
                y: this.y,
              },
              userId: this.userId,
              users:
                RoomManager.getInstance()
                  .rooms.get(spaceId)!
                  .filter((u) => u.userId !== this.userId)
                  .map((u) => ({
                    x: u.x,
                    y: u.y,
                    id: u.userId,
                  })) ?? [],
            },
          });

          RoomManager.getInstance().broadcastToRoom(spaceId, this, {
            type: "user-joined",
            payload: {
              userId: this.userId,
              x: this.x,
              y: this.y,
            },
          });
          break;

        case "move":
          const moveX = parsedData.payload.x;
          const moveY = parsedData.payload.y;

          if (
            Math.abs(this.x - moveX) > 1 ||
            Math.abs(this.y - moveY) > 1 ||
            (Math.abs(this.x - moveX) === 1 && Math.abs(this.y - moveY) === 1)
          ) {
            console.log("Invalid move", this.x, this.y, moveX, moveY);
            this.send({
              type: "movement-rejected",
              payload: {
                x: this.x,
                y: this.y,
              },
            });
            return;
          }

          this.x = moveX;
          this.y = moveY;

          RoomManager.getInstance().broadcastToRoom(this.spaceId!, this, {
            type: "movement",
            payload: {
              x: this.x,
              y: this.y,
              userId: this.userId,
            },
          });
          break;

        default:
          console.log("Unknown message type", parsedData.type);
          break;
      }
    });
  }

  destroy() {
    RoomManager.getInstance().broadcastToRoom(this.spaceId!, this, {
      type: "user-left",
      payload: {
        userId: this.userId,
      },
    });
    RoomManager.getInstance().removeUserFromRoom(this.spaceId!, this);
  }

  send(data: any) {
    this.ws.send(JSON.stringify(data));
  }
}
