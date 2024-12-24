import type { User } from "./user";

export class RoomManager {
  rooms: Map<string, User[]> = new Map();
  static instance: RoomManager;

  constructor() {
    this.rooms = new Map();
  }

  static getInstance() {
    if (!this.instance) {
      this.instance = new RoomManager();
    }
    return this.instance;
  }

  public addUserToRoom(roomId: string, user: User) {
    if (!this.rooms.has(roomId)) {
      this.rooms.set(roomId, []);
    }

    this.rooms.get(roomId)!.push(user);
  }

  public removeUserFromRoom(roomId: string, user: User) {
    if (!this.rooms.has(roomId)) {
      return;
    }

    this.rooms.set(
      roomId,
      this.rooms.get(roomId)?.filter((u) => u.userId !== user.userId) ?? []
    );
  }

  public broadcastToRoom(roomId: string, user: User, data: any) {
    if (!this.rooms.has(roomId)) {
      return;
    }

    const users = this.rooms.get(roomId)!;
    users.forEach((u) => {
      if (u.userId !== user.userId) {
        u.send(data);
      }
    });
  }
}
