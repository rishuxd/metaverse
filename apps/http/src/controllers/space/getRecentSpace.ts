import { Request, Response } from "express";
import client from "@repo/db/client";
import ApiResponse from "../../utils/apiResponse";
import ApiError from "../../utils/apiError";

const getRecentSpaces = async (req: Request, res: Response): Promise<void> => {
  try {
    const recentSpaces = await client.userSpace.findMany({
      where: {
        userId: req.user!.id,
        space: {
          creatorId: {
            not: req.user!.id,
          },
        },
      },
      include: {
        space: {
          include: {
            map: true,
            creator: {
              select: {
                id: true,
                username: true,
                avatarId: true,
              },
            },
          },
        },
      },
      orderBy: {
        joinedAt: "desc",
      },
    });

    res.json(
      new ApiResponse(200, "Recent spaces fetched successfully.", {
        recentSpaces,
      })
    );
    return;
  } catch (error) {
    console.error("Error fetching recent spaces:", error);
    res.json(
      new ApiError(500, "Failed to fetch recent spaces, try later!", error)
    );
    return;
  }
};

export default getRecentSpaces;
