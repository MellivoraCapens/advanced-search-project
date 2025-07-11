import { ErrorResponse } from "../utils/errorResponse";
import { Request, Response, NextFunction } from "express";

export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  let error = new ErrorResponse(err.message, err.statusCode);
  console.error(err);

  if (err.name === "CastError") {
    const message = `Resource not found.`;
    error = new ErrorResponse(message, 404);
  }

  if (err.name === "SyntaxError" && err.statusCode === 400) {
    const message = `Invalid JSON syntax`;
    error = new ErrorResponse(message, 400);
  }
  if (err.name === "TypeError") {
    const message = `Type error occurred`;
    error = new ErrorResponse(message, 400);
  }

  if (err.code === 11000) {
    const message = `Duplicate field value entered`;
    error = new ErrorResponse(message, 400);
  }

  res.status(error.statusCode || 500).json({
    success: false,
    error: `Error: ${error.message}` || "Server Error",
  });
};
