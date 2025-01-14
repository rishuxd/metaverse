import { Request, Response } from "express";
import ApiError from "../../utils/apiError";
import client from "@repo/db/client";
import ApiResponse from "../../utils/apiResponse";

const getAvailableMaps = async (req: Request, res: Response): Promise<void> => {
  try {
    const maps = await client.map.findMany();

    res.status(200).json(new ApiResponse(201, "Avatars fetched.", maps));
  } catch (error) {
    res
      .status(500)
      .json(new ApiError(500, "Failed to fetch avatars, try later!"));
    return;
  }
};

export default getAvailableMaps;
