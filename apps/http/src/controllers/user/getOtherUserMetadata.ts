import { Request, Response } from "express";
import ApiError from "../../utils/apiError";
import prisma from "../../config/prisma";
import ApiResponse from "../../utils/apiResponse";

const getOtherUserMetadata = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const userIdString = (req.query.ids ?? "[]") as string;
  const userIds = userIdString.slice(1, userIdString.length - 1).split(",");
  try {
    const users = await prisma.user.findMany({
      where: {
        id: {
          in: userIds,
        },
      },
      select: {
        id: true,
        avatar: true,
      },
    });

    if (!users) {
      res.status(404).json(new ApiError(404, "Users not found!"));
      return;
    }

    res.status(201).json(
      new ApiResponse(201, "Users metadata fetched.", {
        users,
      }),
    );
    return;
  } catch (error) {
    res
      .status(500)
      .json(new ApiError(500, "Failed to fetch users metadata, try later!"));
    return;
  }
};

export default getOtherUserMetadata;
