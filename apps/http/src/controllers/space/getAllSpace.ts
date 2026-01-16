import { Request, Response } from "express";
import prisma from "../../config/prisma";
import ApiResponse from "../../utils/apiResponse";
import ApiError from "../../utils/apiError";

const getAllSpace = async (req: Request, res: Response): Promise<void> => {
  try {
    const spaces = await prisma.space.findMany({
      where: {
        creatorId: req.user?.id,
      },
      include: {
        map: true,
      },
    });

    res.json(
      new ApiResponse(200, "Spaces fetched successfully", {
        spaces,
      }),
    );
    return;
  } catch (error) {
    res.json(new ApiError(500, "Failed to fetch spaces, try later!", error));
    return;
  }
};

export default getAllSpace;
