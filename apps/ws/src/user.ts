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

interface ChatMessage {
  type: "chat";
  payload: {
    message: string;
    userId: string;
    username: string;
    timestamp: Date;
    targetUsers?: string[];
  };
}

export class User {
  public userId?: string;
  private username?: string;
  private avatarUrl?: string;
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

        case "chat":
          this.handleChat(parsedData.payload);
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

  private handleChat(payload: { message: string; targetUsers?: string[] }) {
    const chatMessage: ChatMessage = {
      type: "chat",
      payload: {
        message: payload.message,
        userId: this.userId!,
        username: this.username!,
        timestamp: new Date(),
        targetUsers: payload.targetUsers,
      },
    };

    if (payload.targetUsers?.length) {
      const targetUsers = RoomManager.getInstance()
        .rooms.get(this.spaceId!)
        ?.filter((user) => payload.targetUsers!.includes(user.userId!));

      if (targetUsers?.length) {
        targetUsers.forEach((user) => {
          user.send(chatMessage);
        });
      }
    } else {
      RoomManager.getInstance().broadcastToRoom(
        this.spaceId!,
        this,
        chatMessage
      );
    }

    // Ensures message timestamp is consistent
    // Confirms message was actually processed by server
    // Maintains same message order for everyone
    // Simpler frontend logic (just display what server sends)
    this.send(chatMessage);
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

    const user = await client.user.findUnique({
      where: {
        id: userId,
      },
      include: {
        avatar: true,
      },
    });

    this.username = user?.username || "Anonymous";
    this.avatarUrl =
      user?.avatar?.imageUrl || "/uploads/1737032864137-avatar1.png";

    this.spaceId = payload.spaceId;

    const existingRecord = await client.userSpace.findFirst({
      where: {
        userId: this.userId,
        spaceId: this.spaceId,
      },
    });

    if (existingRecord) {
      await client.userSpace.update({
        where: { id: existingRecord.id },
        data: {
          joinedAt: new Date(),
          leftAt: null,
        },
      });
    } else {
      await client.userSpace.create({
        data: {
          userId: this.userId!,
          spaceId: this.spaceId,
          joinedAt: new Date(),
        },
      });
    }

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
        username: this.username,
        avatarUrl: this.avatarUrl,
        users:
          RoomManager.getInstance()
            .rooms.get(payload.spaceId)!
            .filter((u) => u.userId !== this.userId)
            .map((u) => ({
              x: u.x,
              y: u.y,
              userId: u.userId,
              username: u.username,
              avatarUrl: u.avatarUrl,
            })) ?? [],
      },
    });

    RoomManager.getInstance().broadcastToRoom(payload.spaceId, this, {
      type: "user-joined",
      payload: {
        userId: this.userId,
        username: this.username,
        avatarUrl: this.avatarUrl,
        x: this.x,
        y: this.y,
      },
    });

    RoomManager.getInstance().broadcastToRoom(payload.spaceId, this, {
      type: "chat",
      payload: {
        message: `${this.username} joined the room.`,
        userId: "system",
        timestamp: new Date(),
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
          username: this.username,
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

  async destroy() {
    try {
      await client.userSpace.update({
        where: {
          userId_spaceId: {
            userId: this.userId!,
            spaceId: this.spaceId!,
          },
        },
        data: {
          leftAt: new Date(),
        },
      });

      RoomManager.getInstance().broadcastToRoom(this.spaceId!, this, {
        type: "user-left",
        payload: {
          userId: this.userId,
        },
      });

      RoomManager.getInstance().broadcastToRoom(this.spaceId!, this, {
        type: "chat",
        payload: {
          message: `${this.username} left the room.`,
          userId: "system",
          timestamp: new Date(),
        },
      });

      RoomManager.getInstance().removeUserFromRoom(this.spaceId!, this);
    } catch (error) {
      console.error("Failed to destroy user-space relationship:", error);
    }
  }

  send(data: any) {
    this.ws.send(JSON.stringify(data));
  }
}
