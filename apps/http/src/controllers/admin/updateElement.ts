import { Request, Response } from "express";
import { updateElementSchema } from "../../types";
import ApiError from "../../utils/apiError";
import client from "@repo/db/client";
import ApiResponse from "../../utils/apiResponse";

const updateElement = async (req: Request, res: Response): Promise<void> => {
  const parsedData = updateElementSchema.safeParse(req.body);
  if (!parsedData.success) {
    res.status(400).json(new ApiError(400, "Invalid data!", parsedData.error));
    return;
  }

  try {
    const element = await client.element.findUnique({
      where: {
        id: req.params.id,
      },
    });

    if (!element) {
      res.status(404).json(new ApiError(404, "Element not found!"));
      return;
    }

    await client.element.update({
      where: {
        id: req.params.id,
      },
      data: {
        imageUrl: parsedData.data.imageUri,
      },
    });

    res.status(201).json(new ApiResponse(201, "Element updated."));
  } catch (error) {
    res
      .status(500)
      .json(new ApiError(500, "Faild to update element, try later!"));
    return;
  }
};

export default updateElement;
