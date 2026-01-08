import { Request, Response } from "express";
import ApiError from "../../utils/apiError";
import client from "@prisma/client";
import ApiResponse from "../../utils/apiResponse";

const getAvailableMaps = async (req: Request, res: Response): Promise<void> => {
  try {
    const maps = await client.map.findMany();

    res.status(200).json(new ApiResponse(201, "Maps fetched.", maps));
  } catch (error) {
    res.status(500).json(new ApiError(500, "Failed to fetch maps, try later!"));
    return;
  }
};

export default getAvailableMaps;
