import { Request, Response } from "express";
import { SigninSchema } from "../../types";
import client from "@repo/db/client";
import ApiError from "../../utils/apiError";
import { compare } from "../../utils/scrypt";
import ApiResponse from "../../utils/apiResponse";
import jwt from "jsonwebtoken";
import { JWT_SECRET } from "../../utils/config";

const signin = async (req: Request, res: Response): Promise<void> => {
  const parsedDate = SigninSchema.safeParse(req.body);
  if (!parsedDate.success) {
    res.status(400).json(new ApiError(400, "Invalid data", parsedDate.error));
    return;
  }

  try {
    const user = await client.user.findUnique({
      where: {
        username: parsedDate.data.username,
      },
    });

    if (!user) {
      res.status(404).json(new ApiError(404, "User not found"));
      return;
    }

    const isValid = await compare(parsedDate.data.password, user.password);
    if (!isValid) {
      res.status(401).json(new ApiError(401, "Invalid password"));
      return;
    }

    const token = jwt.sign({ id: user.id, role: user.role }, JWT_SECRET);

    res.status(200).json(
      new ApiResponse(200, "User signed in", {
        token,
      })
    );
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
    return;
  }
};

export default signin;
