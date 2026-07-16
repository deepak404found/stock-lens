import type { NextFunction, Request, Response } from "express";
import { ZodError } from "zod";
import { logger } from "../config/logger.js";
import { AppError } from "../shared/errors.js";
import { sendError } from "../shared/api-response.js";

export function errorHandler(
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void {
  if (err instanceof AppError) {
    sendError(res, err.message, err.statusCode, err.errors);
    return;
  }

  if (err instanceof ZodError) {
    sendError(
      res,
      "Validation failed",
      400,
      err.issues.map((issue) => ({
        path: issue.path.join("."),
        message: issue.message,
      })),
    );
    return;
  }

  logger.error({ err }, "Unhandled error");
  sendError(res, "Internal server error", 500);
}
