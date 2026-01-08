import { z } from "zod";

// Password validation with complexity requirements
const passwordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters")
  .max(100, "Password must not exceed 100 characters")
  .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
  .regex(/[a-z]/, "Password must contain at least one lowercase letter")
  .regex(/[0-9]/, "Password must contain at least one number");

// Username validation
const usernameSchema = z
  .string()
  .min(3, "Username must be at least 3 characters")
  .max(20, "Username must not exceed 20 characters")
  .regex(
    /^[a-zA-Z0-9_-]+$/,
    "Username can only contain letters, numbers, underscores, and hyphens",
  );

export const SignupSchema = z.object({
  username: usernameSchema,
  password: passwordSchema,
  type: z.enum(["admin", "user"]).optional(),
});

export const SigninSchema = z.object({
  username: usernameSchema,
  password: z.string().min(1, "Password is required"),
});

export const updateUserMetadataSchema = z.object({
  avatarId: z.string().min(1, "Avatar ID is required"),
});

export const createAvatarSchema = z.object({
  name: z.string().min(1, "Avatar name is required").max(50),
});

export const createSpaceSchema = z.object({
  name: z.string().min(1, "Space name is required").max(100),
  mapId: z.string().min(1, "Map ID is required"),
});

export const createMapSchema = z.object({
  name: z.string().min(1, "Map name is required").max(100),
  width: z.string().regex(/^\d+$/, "Width must be a valid number"),
  height: z.string().regex(/^\d+$/, "Height must be a valid number"),
  description: z.string().min(1, "Description is required").max(500),
  walls: z.array(z.string()).optional(),
});

export const updateMapSchema = z
  .object({
    name: z.string().min(1).max(100).optional(),
    width: z.string().regex(/^\d+$/).optional(),
    height: z.string().regex(/^\d+$/).optional(),
    description: z.string().min(1).max(500).optional(),
    walls: z.array(z.string()).optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: "At least one field must be provided for update!",
  });

// Export types for TypeScript
export type SignupInput = z.infer<typeof SignupSchema>;
export type SigninInput = z.infer<typeof SigninSchema>;
export type UpdateUserMetadataInput = z.infer<typeof updateUserMetadataSchema>;
export type CreateAvatarInput = z.infer<typeof createAvatarSchema>;
export type CreateSpaceInput = z.infer<typeof createSpaceSchema>;
export type CreateMapInput = z.infer<typeof createMapSchema>;
export type UpdateMapInput = z.infer<typeof updateMapSchema>;
