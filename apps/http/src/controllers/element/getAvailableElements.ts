import { Request, Response } from "express";
import ApiError from "../../utils/apiError";
import client from "@repo/db/client";
import ApiResponse from "../../utils/apiResponse";

const getAvailableElements = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const elements = await client.element.findMany();

    res.status(201).json(
      new ApiResponse(201, "Elements fetched.", {
        elements: elements.map((element) => ({
          id: element.id,
          width: element.width,
          height: element.height,
          static: element.static,
          url: element.imageUrl,
        })),
      })
    );
  } catch (error) {
    res
      .status(500)
      .json(
        new ApiError(500, "Failed to fetch available elements, try later!")
      );
    return;
  }
};

export default getAvailableElements;
