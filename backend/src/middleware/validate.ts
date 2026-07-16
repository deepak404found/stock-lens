import type { NextFunction, Request, Response } from "express";
import type { ZodTypeAny } from "zod";
import { ValidationError } from "../shared/errors.js";

type RequestTarget = "body" | "query" | "params";

export function validate(schema: ZodTypeAny, target: RequestTarget = "body") {
  return (req: Request, _res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req[target]);
    if (!result.success) {
      next(
        new ValidationError(
          "Validation failed",
          result.error.issues.map((issue) => ({
            path: issue.path.join("."),
            message: issue.message,
          })),
        ),
      );
      return;
    }

    req[target] = result.data;
    next();
  };
}
