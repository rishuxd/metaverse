import { Request, Response } from "express";
import { updateMapSchema } from "../../types";
import ApiError from "../../utils/apiError";
import prisma from "../../config/prisma";
import ApiResponse from "../../utils/apiResponse";

const updateMap = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;

  const parsedData = updateMapSchema.safeParse(req.body);
  if (!parsedData.success) {
    res.status(400).json(new ApiError(400, "Invalid data!", parsedData.error));
    return;
  }

  try {
    const updateData: any = {};

    if (parsedData.data.name) updateData.name = parsedData.data.name;
    if (parsedData.data.description)
      updateData.description = parsedData.data.description;
    if (parsedData.data.width)
      updateData.width = parseInt(parsedData.data.width);
    if (parsedData.data.height)
      updateData.height = parseInt(parsedData.data.height);
    if (parsedData.data.walls) updateData.walls = parsedData.data.walls;

    if (req.file) {
      updateData.imageUrl = `/api/v1/uploads/${req.file.filename}`;
    }

    // Update the map
    const updatedMap = await prisma.map.update({
      where: { id },
      data: updateData,
    });

    if (!updatedMap) {
      res.status(404).json(new ApiError(404, "Map not found!"));
      return;
    }

    res.status(200).json(
      new ApiResponse(200, "Map updated successfully.", {
        mapId: updatedMap.id,
      }),
    );
  } catch (error) {
    res.status(500).json(new ApiError(500, "Could not update map, try later!"));
    return;
  }
};

export default updateMap;
