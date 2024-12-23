import jwt from "jsonwebtoken";
import { JWT_SECRET } from "../utils/config";
import { NextFunction, Request, Response } from "express";

export const adminMiddleware = (
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
    const decoded = jwt.verify(token, JWT_SECRET) as {
      role: string;
      id: string;
    };

    if (decoded.role !== "Admin") {
      res.status(403).json({ message: "Unauthorized!" });
      return;
    }
    req.user = decoded;
    next();
  } catch (e) {
    res.status(401).json({ message: "Unauthorized!" });
    return;
  }
};
