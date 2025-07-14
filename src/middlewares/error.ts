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
  console.log(error);

  res.status(error.statusCode || 500).json({
    success: false,
    error: `Error: ${err.errmsg}` || "Error: Server Error",
  });
};
