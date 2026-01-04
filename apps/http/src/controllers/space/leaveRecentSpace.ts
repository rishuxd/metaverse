import { Request, Response } from "express";
import client from "@repo/db/client";
import ApiResponse from "../../utils/apiResponse";
import ApiError from "../../utils/apiError";

const leaveRecentSpace = async (req: Request, res: Response): Promise<void> => {
  try {
    const { spaceId } = req.params;
    const userId = req.user!.id;

    // Check if user has joined this space
    const userSpace = await client.userSpace.findUnique({
      where: {
        userId_spaceId: {
          userId,
          spaceId,
        },
      },
    });

    if (!userSpace) {
      res.json(new ApiError(404, "You haven't joined this space"));
      return;
    }

    // Delete the UserSpace record (leave the space)
    await client.userSpace.delete({
      where: {
        userId_spaceId: {
          userId,
          spaceId,
        },
      },
    });

    res.json(
      new ApiResponse(200, "Successfully left the space", {
        spaceId,
      })
    );
    return;
  } catch (error) {
    console.error("Error leaving space:", error);
    res.json(new ApiError(500, "Failed to leave space, try later!", error));
    return;
  }
};

export default leaveRecentSpace;
