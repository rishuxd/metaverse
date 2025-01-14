// user.ts
import { WebSocket } from "ws";
import { RoomManager } from "./roomManager";
import jwt, { JwtPayload } from "jsonwebtoken";
import { JWT_SECRET } from "./utils/config";
import client from "@repo/db/client";

interface WebRTCMessage {
  type: "webrtc-offer" | "webrtc-answer" | "webrtc-ice-candidate";
  payload: {
    targetUserId: string;
    offer?: RTCSessionDescriptionInit;
    answer?: RTCSessionDescriptionInit;
    candidate?: RTCIceCandidateInit;
    from?: string;
  };
}

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
          await this.handleJoin(parsedData.payload);
          break;

        case "move":
          this.handleMove(parsedData.payload);
          break;

        case "webrtc-offer":
          this.handleWebRTCOffer(parsedData as WebRTCMessage);
          break;

        case "webrtc-answer":
          this.handleWebRTCAnswer(parsedData as WebRTCMessage);
          break;

        case "webrtc-ice-candidate":
          this.handleWebRTCIceCandidate(parsedData as WebRTCMessage);
          break;

        case "media-state-update":
          this.handleMediaStateUpdate(parsedData.payload);
          break;
        default:
          console.log("Unknown message type", parsedData.type);
          break;
      }
    });
  }

  private handleMediaStateUpdate(payload: any) {
    RoomManager.getInstance().broadcastToRoom(this.spaceId!, this, {
      type: "media-state-update",
      payload,
    });
  }

  private async handleJoin(payload: { spaceId: string; token: string }) {
    const space = await client.space.findUnique({
      where: {
        id: payload.spaceId,
      },
      include: {
        map: true,
      },
    });

    if (!space) {
      this.ws.close();
      return;
    }

    const userId = (jwt.verify(payload.token, JWT_SECRET) as JwtPayload).id;
    if (!userId) {
      this.ws.close();
      return;
    }

    this.userId = userId;
    this.spaceId = payload.spaceId;

    RoomManager.getInstance().addUserToRoom(payload.spaceId, this);

    this.x = Math.floor(Math.random() * space?.map.width);
    this.y = Math.floor(Math.random() * space?.map.height);

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
            .rooms.get(payload.spaceId)!
            .filter((u) => u.userId !== this.userId)
            .map((u) => ({
              x: u.x,
              y: u.y,
              userId: u.userId,
            })) ?? [],
      },
    });

    RoomManager.getInstance().broadcastToRoom(payload.spaceId, this, {
      type: "user-joined",
      payload: {
        userId: this.userId,
        x: this.x,
        y: this.y,
      },
    });
  }

  private handleMove(payload: { x: number; y: number }) {
    this.x = payload.x;
    this.y = payload.y;

    RoomManager.getInstance().broadcastToRoom(this.spaceId!, this, {
      type: "movement",
      payload: {
        x: this.x,
        y: this.y,
        userId: this.userId,
      },
    });
  }

  private handleWebRTCOffer(message: WebRTCMessage) {
    const targetUser = RoomManager.getInstance()
      .rooms.get(this.spaceId!)
      ?.find((user) => user.userId === message.payload.targetUserId);

    if (targetUser) {
      targetUser.send({
        type: "webrtc-offer",
        payload: {
          offer: message.payload.offer,
          from: this.userId,
        },
      });
    }
  }

  private handleWebRTCAnswer(message: WebRTCMessage) {
    const targetUser = RoomManager.getInstance()
      .rooms.get(this.spaceId!)
      ?.find((user) => user.userId === message.payload.targetUserId);

    if (targetUser) {
      targetUser.send({
        type: "webrtc-answer",
        payload: {
          answer: message.payload.answer,
          from: this.userId,
        },
      });
    }
  }

  private handleWebRTCIceCandidate(message: WebRTCMessage) {
    const targetUser = RoomManager.getInstance()
      .rooms.get(this.spaceId!)
      ?.find((user) => user.userId === message.payload.targetUserId);

    if (targetUser) {
      targetUser.send({
        type: "webrtc-ice-candidate",
        payload: {
          candidate: message.payload.candidate,
          from: this.userId,
        },
      });
    }
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
