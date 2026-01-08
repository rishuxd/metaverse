import e, { Request, Response } from "express";
import client from "@prisma/client";
import { SignupSchema } from "../../types";
import ApiError from "../../utils/apiError";
import ApiResponse from "../../utils/apiResponse";
import { hash } from "../../utils/scrypt";

const signup = async (req: Request, res: Response): Promise<void> => {
  const parsedDate = SignupSchema.safeParse(req.body);
  if (!parsedDate.success) {
    res.status(400).json(new ApiError(400, "Invalid data", parsedDate.error));
    return;
  }

  const hashedPassword = await hash(parsedDate.data.password);

  try {
    const user = await client.user.create({
      data: {
        username: parsedDate.data.username,
        password: hashedPassword,
        role: parsedDate.data.type === "admin" ? "Admin" : "User",
      },
    });

    res.status(201).json(
      new ApiResponse(201, "User created successfully", {
        userId: user.id,
      })
    );
    return;
  } catch (error) {
    res
      .status(500)
      .json(new ApiError(500, "Can't create user, try later!", error));
    return;
  }
};

export default signup;
