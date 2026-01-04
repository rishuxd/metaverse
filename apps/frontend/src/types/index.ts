export type Map = {
  id: string;
  width: number;
  height: number;
  name: string;
  description: string;
  imageUrl: string;
};

export type Space = {
  id: string;
  name: string;
  createdAt: string;
  mapId: string;
  creatorId: string;
  map: Map;
  creator?: {
    id: string;
    username: string;
    avatarId?: string;
  };
};

export type RecentSpace = {
  id: string;
  userId: string;
  spaceId: string;
  joinedAt: string;
  leftAt: string;
  space: Space;
};

export type Avatar = {
  id: string;
  name: string;
  url: string;
};
