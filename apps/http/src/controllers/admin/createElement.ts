import { Request, Response } from "express";
import { createElementSchema } from "../../types";
import ApiError from "../../utils/apiError";
import client from "@repo/db/client";
import ApiResponse from "../../utils/apiResponse";

const createElement = async (req: Request, res: Response): Promise<void> => {
  const parsedData = createElementSchema.safeParse(req.body);
  if (!parsedData.success) {
    res.status(400).json(new ApiError(400, "Invalid data!", parsedData.error));
    return;
  }

  try {
    const element = await client.element.create({
      data: {
        height: parsedData.data.height,
        width: parsedData.data.width,
        imageUrl: parsedData.data.imageUri,
        static: parsedData.data.static,
      },
    });

    if (!element) {
      res.status(500).json(new ApiError(500, "Failed to create element!"));
      return;
    }

    res.status(201).json(
      new ApiResponse(201, "Element created.", {
        elementId: element.id,
      })
    );
  } catch (error) {
    res.status(500).json(new ApiError(500, "Internal Server Error!"));
    return;
  }
};

export default createElement;