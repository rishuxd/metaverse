import { z } from "zod";

export const SignupSchema = z.object({
  username: z.string(),
  password: z.string().min(8),
  type: z.enum(["user", "admin"]),
});

export const SigninSchema = z.object({
  username: z.string(),
  password: z.string().min(8),
});

export const updateUserMetadataSchema = z.object({
  avatarId: z.string(),
});

export const createSpaceSchema = z.object({
  name: z.string(),
  dimensions: z.string(),
  mapId: z.string().optional(),
});

export const addElementSchema = z.object({
  elementId: z.string(),
  spaceId: z.string(),
  x: z.number(),
  y: z.number(),
});

export const createElementSchema = z.object({
  imageUri: z.string(),
  width: z.number(),
  height: z.number(),
  static: z.boolean(),
});

export const updateElementSchema = z.object({
  imageUri: z.string(),
});

export const createAvatarSchema = z.object({
  imageUri: z.string(),
  name: z.string(),
});

export const createMapSchema = z.object({
  thumbnailUri: z.string(),
  dimensions: z.string(),
  name: z.string(),
  defaultElements: z.array(
    z.object({
      elementId: z.string(),
      x: z.number(),
      y: z.number(),
    })
  ),
});
