import jwt from "jsonwebtoken";
import { JWT_SECRET } from "../utils/config";
import { NextFunction, Request, Response } from "express";

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        role: string;
      };
    }
  }
}

export const userMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  console.log("userMiddleware");
  console.log(req.headers);
  const header = req.headers["authorization"];
  const token = header?.split(" ")[1];

  if (!token) {
    res.status(403).json({ message: "Unauthorized!" });
    return;
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as {
      id: string;
      role: string;
    };
    req.user = decoded;

    next();
  } catch (e) {
    res.status(401).json({ message: "Unauthorized!" });
    return;
  }
};
