import { Request, Response } from "express";
import ApiError from "../../utils/apiError";
import client from "@repo/db/client";
import ApiResponse from "../../utils/apiResponse";

const getAvailableAvatars = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const avatars = await client.avatar.findMany();

    res.status(201).json(
      new ApiResponse(201, "Avatars fetched.", {
        avatars: avatars.map((avatar) => ({
          id: avatar.id,
          name: avatar.name,
          url: avatar.imageUrl,
        })),
      })
    );
  } catch (error) {
    res
      .status(500)
      .json(new ApiError(500, "Failed to fetch avatars, try later!"));
    return;
  }
};

export default getAvailableAvatars;
