import type { User } from "../user";

export class RoomManager {
  private static instance: RoomManager;
  private rooms: Map<string, User[]> = new Map();

  private constructor() {}

  static getInstance(): RoomManager {
    if (!this.instance) {
      this.instance = new RoomManager();
    }
    return this.instance;
  }

  addUserToRoom(roomId: string, user: User): void {
    if (!this.rooms.has(roomId)) {
      this.rooms.set(roomId, []);
    }
    this.rooms.get(roomId)!.push(user);
  }

  removeUserFromRoom(roomId: string, user: User): void {
    const users = this.rooms.get(roomId);
    if (!users) return;

    const filtered = users.filter((u) => u.userId !== user.userId);
    this.rooms.set(roomId, filtered);
  }

  broadcastToRoom(roomId: string, excludeUser: User, data: any): void {
    const users = this.rooms.get(roomId);
    if (!users) return;

    users.forEach((user) => {
      if (user.userId !== excludeUser.userId) {
        user.send(data);
      }
    });
  }

  getActiveUsersInRoom(roomId: string) {
    const users = this.rooms.get(roomId) || [];
    return users.map((u) => ({
      userId: u.userId,
      username: u.username,
      avatarUrl: u.avatarUrl,
    }));
  }

  getRoomUserCount(roomId: string): number {
    return this.rooms.get(roomId)?.length || 0;
  }

  getRoomUsers(roomId: string): User[] {
    return this.rooms.get(roomId) || [];
  }
}
