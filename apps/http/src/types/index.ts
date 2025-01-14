import { z } from "zod";

export const SignupSchema = z.object({
  username: z.string(),
  password: z.string().min(8),
  type: z.string().optional(),
});

export const SigninSchema = z.object({
  username: z.string(),
  password: z.string().min(8),
});

export const updateUserMetadataSchema = z.object({
  avatarId: z.string(),
});

export const createAvatarSchema = z.object({
  name: z.string(),
});

export const createSpaceSchema = z.object({
  name: z.string(),
  mapId: z.string(),
});

export const createMapSchema = z.object({
  name: z.string(),
  width: z.string(),
  height: z.string(),
  description: z.string(),
});
