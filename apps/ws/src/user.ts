import { WebSocket } from "ws";
import { RoomManager } from "./roomManager";
import jwt, { JwtPayload } from "jsonwebtoken";
import { JWT_SECRET } from "./utils/config";
import client from "@repo/db/client";

function getRandomString(length: number) {
  const characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let result = "";
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
}

export class User {
  public id: string;
  public userId?: string;
  private spaceId?: string;
  private x: number;
  private y: number;
  private ws: WebSocket;

  constructor(ws: WebSocket) {
    this.id = getRandomString(10);
    this.x = 0;
    this.y = 0;
    this.ws = ws;
    this.init();
  }

  init() {
    this.ws.on("message", async (data) => {
      const parsedData = JSON.parse(data.toString());

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
              users:
                RoomManager.getInstance()
                  .rooms.get(spaceId)!
                  .map((u) => ({ id: u.id })) ?? [],
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
