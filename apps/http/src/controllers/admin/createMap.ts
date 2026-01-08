import { Request, Response } from "express";
import { createMapSchema } from "../../types";
import ApiError from "../../utils/apiError";
import prisma from "../../config/prisma";
import ApiResponse from "../../utils/apiResponse";

const createMap = async (req: Request, res: Response): Promise<void> => {
  if (!req.file) {
    res.status(400).json(new ApiError(400, "Image upload failed!"));
    return;
  }

  const parsedData = createMapSchema.safeParse(req.body);
  if (!parsedData.success) {
    res.status(400).json(new ApiError(400, "Invalid data!", parsedData.error));
    return;
  }

  const imageUrl = `/api/v1/uploads/${req.file.filename}`;

  try {
    const map = await prisma.map.create({
      data: {
        name: parsedData.data.name,
        width: parseInt(parsedData.data.width),
        height: parseInt(parsedData.data.height),
        description: parsedData.data.description,
        walls: parsedData.data.walls,
        imageUrl,
      },
    });

    if (!map) {
      res.status(500).json(new ApiError(500, "Failed to create map!"));
      return;
    }

    res.status(201).json(
      new ApiResponse(201, "Map created.", {
        mapId: map.id,
      }),
    );
  } catch (error) {
    res.status(500).json(new ApiError(500, "Internal Server Error!"));
    return;
  }
};

export default createMap;
