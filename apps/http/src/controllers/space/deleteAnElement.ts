import { Request, Response } from "express";
import ApiError from "../../utils/apiError";
import client from "@repo/db/client";
import ApiResponse from "../../utils/apiResponse";

const deleteAnElement = async (req: Request, res: Response): Promise<void> => {
  try {
    const spaceElement = await client.spaceElements.findFirst({
      where: {
        id: req.params.id,
      },
      include: {
        space: true,
      },
    });

    if (
      !spaceElement?.space.creatorId ||
      spaceElement.space.creatorId !== req.user?.id
    ) {
      res.status(403).json(new ApiError(403, "You are not authorized!"));
      return;
    }

    await client.spaceElements.delete({
      where: {
        id: req.params.id,
      },
    });

    res.status(200).json(new ApiResponse(200, "Element removed successfully."));
  } catch (error) {
    res
      .status(500)
      .json(
        new ApiError(500, "Failed to remove element from the space, try later!")
      );
    return;
  }
};

export default deleteAnElement;
