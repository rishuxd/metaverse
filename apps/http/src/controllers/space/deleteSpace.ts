import { Request, Response } from "express";
import ApiError from "../../utils/apiError";
import client from "@repo/db/client";
import ApiResponse from "../../utils/apiResponse";

const deleteSpace = async (req: Request, res: Response): Promise<void> => {
  try {
    const space = await client.space.findUnique({
      where: {
        id: req.params.spaceId,
      },
      select: {
        creatorId: true,
      },
    });

    if (!space) {
      res.status(404).json(new ApiError(404, "Space not found!"));
      return;
    }

    if (space.creatorId !== req.user?.id) {
      res
        .status(403)
        .json(
          new ApiError(403, "You are not authorized to delete this space!")
        );
      return;
    }

    await client.space.delete({
      where: {
        id: req.params.spaceId,
      },
    });

    res.status(200).json(new ApiResponse(200, "Space deleted successfully!"));
    return;
  } catch (error) {
    res
      .status(500)
      .json(new ApiError(500, "Failed to delete space, try later!"));
    return;
  }
};

export default deleteSpace;
