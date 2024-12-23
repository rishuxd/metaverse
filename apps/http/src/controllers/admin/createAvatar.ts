import { Request, Response } from "express";
import { createAvatarSchema } from "../../types";
import ApiError from "../../utils/apiError";
import client from "@repo/db/client";
import ApiResponse from "../../utils/apiResponse";

const createAvatar = async (req: Request, res: Response): Promise<void> => {
  const parsedData = createAvatarSchema.safeParse(req.body);
  if (!parsedData.success) {
    res.status(400).json(new ApiError(400, "Invalid data!", parsedData.error));
    return;
  }

  try {
    const avatar = await client.avatar.create({
      data: {
        name: parsedData.data.name,
        imageUrl: parsedData.data.imageUri,
      },
    });

    if (!avatar) {
      res.status(500).json(new ApiError(500, "Failed to create avatar!"));
      return;
    }

    res.status(201).json(
      new ApiResponse(201, "Avatar created.", {
        avatarId: avatar.id,
      })
    );
  } catch (error) {
    res.status(500).json(new ApiError(500, "Internal Server Error!"));
    return;
  }
};

export default createAvatar;
