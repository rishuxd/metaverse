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
  walls: z.array(z.string()).optional(),
});

export const updateMapSchema = z
  .object({
    name: z.string().min(1).optional(),
    width: z.string().regex(/^\d+$/).optional(),
    height: z.string().regex(/^\d+$/).optional(),
    description: z.string().min(1).optional(),
    walls: z.array(z.string()).optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: "At least one field must be provided for update!",
  });
