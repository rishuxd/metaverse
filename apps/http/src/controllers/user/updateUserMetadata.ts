import { Request, Response } from "express";
import { updateUserMetadataSchema } from "../../types";
import ApiError from "../../utils/apiError";
import prisma from "../../config/prisma";
import ApiResponse from "../../utils/apiResponse";

const updateUserMetadata = async (
  req: Request,
  res: Response
): Promise<void> => {
  const parsedData = updateUserMetadataSchema.safeParse(req.body);
  if (!parsedData.success) {
    res.status(400).json(new ApiError(400, "Invalid data!", parsedData.error));
    return;
  }

  try {
    const user = await prisma.user.findUnique({
      where: {
        id: req.user?.id,
      },
    });

    if (!user) {
      res.status(404).json(new ApiError(404, "User not found!"));
      return;
    }

    await prisma.user.update({
      where: {
        id: req.user?.id,
      },
      data: {
        avatarId: parsedData.data.avatarId,
      },
    });

    const avatar = await prisma.avatar.findUnique({
      where: {
        id: parsedData.data.avatarId,
      },
    });

    res.status(201).json(new ApiResponse(201, "User updated.", avatar));
    return;
  } catch (error) {
    res
      .status(500)
      .json(new ApiError(500, "Failed to update user, try later!"));
    return;
  }
};

export default updateUserMetadata;
