import jwt from "jsonwebtoken";
import { config } from "../config/constants";
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
  const header = req.headers["authorization"];
  const token = header?.split(" ")[1];

  if (!token) {
    res.status(403).json({ message: "Unauthorized!" });
    return;
  }

  try {
    const decoded = jwt.verify(token, config.jwtSecret) as {
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
