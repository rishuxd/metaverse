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
    if (!parsedData.data.mapId) {
      const space = await client.space.create({
        data: {
          name: parsedData.data.name,
          width: parseInt(parsedData.data.dimensions.split("x")[0]),
          height: parseInt(parsedData.data.dimensions.split("x")[1]),
          creatorId: req.user?.id!,
        },
      });
      res.json(
        new ApiResponse(201, "Space created successfully!", {
          spaceId: space.id,
        })
      );
      return;
    }

    const map = await client.map.findUnique({
      where: {
        id: parsedData.data.mapId,
      },
      select: {
        mapElements: true,
        width: true,
        height: true,
      },
    });

    if (!map) {
      res.status(404).json(new ApiError(404, "Map not found!"));
      return;
    }

    let space = await client.$transaction(async () => {
      const space = await client.space.create({
        data: {
          name: parsedData.data.name,
          width: map.width,
          height: map.height,
          creatorId: req.user?.id!,
        },
      });

      await client.spaceElements.createMany({
        data: map.mapElements.map((element) => ({
          spaceId: space.id,
          elementId: element.elementId,
          x: element.x!,
          y: element.y!,
        })),
      });

      return space;
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
