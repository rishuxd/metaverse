import { Response } from "express";
import { ZodError } from "zod";

export class ApiError extends Error {
  statusCode: number;
  isOperational: boolean;

  constructor(statusCode: number, message: string, isOperational = true) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    Error.captureStackTrace(this, this.constructor);
  }
}

export const handleError = (error: unknown, res: Response) => {
  // Log the error for debugging
  console.error("[Error]:", {
    message: error instanceof Error ? error.message : "Unknown error",
    stack: error instanceof Error ? error.stack : undefined,
    timestamp: new Date().toISOString(),
  });

  // Handle Zod validation errors
  if (error instanceof ZodError) {
    return res.status(400).json({
      success: false,
      message: "Validation error",
      errors: error.errors.map((err) => ({
        field: err.path.join("."),
        message: err.message,
      })),
    });
  }

  // Handle custom API errors
  if (error instanceof ApiError) {
    return res.status(error.statusCode).json({
      success: false,
      message: error.message,
    });
  }

  // Handle Prisma errors
  if (error && typeof error === "object" && "code" in error) {
    const prismaError = error as { code: string; meta?: any };

    switch (prismaError.code) {
      case "P2002":
        return res.status(409).json({
          success: false,
          message: "A record with this value already exists",
        });
      case "P2025":
        return res.status(404).json({
          success: false,
          message: "Record not found",
        });
      default:
        return res.status(500).json({
          success: false,
          message: "Database error occurred",
        });
    }
  }

  // Generic server error
  return res.status(500).json({
    success: false,
    message: "Internal server error",
  });
};

export class ApiResponse {
  constructor(
    public statusCode: number,
    public message: string,
    public data?: any
  ) {}
}
