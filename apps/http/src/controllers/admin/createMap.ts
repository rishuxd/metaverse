import { Request, Response } from "express";
import { createMapSchema } from "../../types";
import ApiError from "../../utils/apiError";
import client from "@repo/db/client";
import ApiResponse from "../../utils/apiResponse";

const createMap = async (req: Request, res: Response): Promise<void> => {
  const parsedData = createMapSchema.safeParse(req.body);
  if (!parsedData.success) {
    res.status(400).json(new ApiError(400, "Invalid data!", parsedData.error));
    return;
  }

  try {
    const map = await client.map.create({
      data: {
        name: parsedData.data.name,
        width: parseInt(parsedData.data.dimensions.split("x")[0]),
        height: parseInt(parsedData.data.dimensions.split("x")[1]),
        thumbnail: parsedData.data.thumbnailUri,
        mapElements: {
          create: parsedData.data.defaultElements.map((element) => ({
            elementId: element.elementId,
            x: element.x,
            y: element.y,
          })),
        },
      },
    });

    if (!map) {
      res.status(500).json(new ApiError(500, "Failed to create map!"));
      return;
    }

    res.status(201).json(
      new ApiResponse(201, "Map created.", {
        mapId: map.id,
      })
    );
  } catch (error) {
    res.status(500).json(new ApiError(500, "Internal Server Error!"));
    return;
  }
};

export default createMap;
