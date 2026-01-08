import { Request, Response } from "express";
import { createAvatarSchema } from "../../types";
import ApiError from "../../utils/apiError";
import prisma from "../../config/prisma";
import ApiResponse from "../../utils/apiResponse";

const createAvatar = async (req: Request, res: Response): Promise<void> => {
  if (!req.file) {
    res.status(400).json(new ApiError(400, "Image upload failed!"));
    return;
  }

  const parsedData = createAvatarSchema.safeParse(req.body);
  if (!parsedData.success) {
    res.status(400).json(new ApiError(400, "Invalid data!", parsedData.error));
    return;
  }

  const imageUrl = `/uploads/${req.file.filename}`;

  try {
    const avatar = await prisma.avatar.create({
      data: {
        name: parsedData.data.name,
        imageUrl,
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
