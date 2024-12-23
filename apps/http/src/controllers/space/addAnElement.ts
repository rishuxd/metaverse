import { Request, Response } from "express";
import { addElementSchema } from "../../types";
import ApiError from "../../utils/apiError";
import client from "@repo/db/client";
import ApiResponse from "../../utils/apiResponse";

const addAnElement = async (req: Request, res: Response): Promise<void> => {
  const parsedData = addElementSchema.safeParse(req.body);
  if (!parsedData.success) {
    res.status(400).json(new ApiError(400, "Invalid data!", parsedData.error));
    return;
  }

  try {
    const space = await client.space.findUnique({
      where: {
        id: parsedData.data.spaceId,
        creatorId: req.user?.id,
      },
      select: {
        width: true,
        height: true,
      },
    });

    if (!space) {
      res.status(404).json(new ApiError(404, "Space not found!"));
      return;
    }

    const element = await client.element.findUnique({
      where: {
        id: parsedData.data.elementId,
      },
    });

    if (!element) {
      res.status(404).json(new ApiError(404, "Element not found!"));
      return;
    }

    if (
      parsedData.data.x < 0 ||
      parsedData.data.x >= space.width ||
      parsedData.data.y < 0 ||
      parsedData.data.y >= space.height!
    ) {
      res.status(400).json(new ApiError(400, "Invalid coordinates!"));
      return;
    }

    await client.spaceElements.create({
      data: {
        elementId: parsedData.data.elementId,
        x: parsedData.data.x,
        y: parsedData.data.y,
        spaceId: parsedData.data.spaceId,
      },
    });

    res.status(201).json(new ApiResponse(201, "Element added successfully!"));
  } catch (error) {
    res
      .status(500)
      .json(
        new ApiError(500, "Failed to add element to the space, try later!")
      );
    return;
  }
};

export default addAnElement;
