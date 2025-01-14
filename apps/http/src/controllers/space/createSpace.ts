import { Request, Response } from "express";
import { createSpaceSchema } from "../../types";
import ApiError from "../../utils/apiError";
import client from "@repo/db/client";
import ApiResponse from "../../utils/apiResponse";

const createSpace = async (req: Request, res: Response): Promise<void> => {
  const parsedData = createSpaceSchema.safeParse(req.body);
  if (!parsedData.success) {
    res.status(400).json(new ApiError(400, "Invalid data!", parsedData.error));
    return;
  }

  try {
    const space = await client.space.create({
      data: {
        name: parsedData.data.name,
        mapId: parsedData.data.mapId,
        creatorId: req.user?.id!,
      },
    });
    res.json(
      new ApiResponse(201, "Space created successfully!", {
        spaceId: space.id,
      })
    );
    return;
  } catch (error) {
    res
      .status(500)
      .json(new ApiError(500, "Failed to create space, try later!"));
    return;
  }
};

export default createSpace;
