import { Request, Response } from "express";
import ApiError from "../../utils/apiError";
import client from "@repo/db/client";
import ApiResponse from "../../utils/apiResponse";

const getSpace = async (req: Request, res: Response): Promise<void> => {
  try {
    const space = await client.space.findUnique({
      where: {
        id: req.params.spaceId,
        creatorId: req.user?.id,
      },
      include: {
        spaceElements: {
          include: {
            element: true,
          },
        },
      },
    });

    if (!space) {
      res.status(404).json(new ApiError(404, "Space not found!"));
      return;
    }

    res.status(200).json(
      new ApiResponse(200, "Space fetched successfully.", {
        dimensions: `${space.width}x${space.height}`,
        elements: space.spaceElements.map((e) => ({
          id: e.id,
          element: {
            id: e.element.id,
            imageUrl: e.element.imageUrl,
            width: e.element.width,
            height: e.element.height,
            static: e.element.static,
          },
          x: e.x,
          y: e.y,
        })),
      })
    );
    return;
  } catch (error) {
    res
      .status(500)
      .json(new ApiError(500, "Failed to fetch space, try later!"));
    return;
  }
};

export default getSpace;
