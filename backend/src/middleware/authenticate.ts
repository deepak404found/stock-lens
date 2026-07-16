import type { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { env } from "../config/env.js";
import { UnauthorizedError } from "../shared/errors.js";
import type { AuthUser } from "../shared/types.js";

type JwtPayload = {
  sub: string;
  email: string;
  fullName: string;
};

export function authenticate(req: Request, _res: Response, next: NextFunction): void {
  const token = req.cookies?.[env.COOKIE_NAME] as string | undefined;

  if (!token) {
    next(new UnauthorizedError("Authentication required"));
    return;
  }

  try {
    const payload = jwt.verify(token, env.JWT_SECRET) as JwtPayload;
    (req as Request & { user: AuthUser }).user = {
      id: payload.sub,
      email: payload.email,
      fullName: payload.fullName,
    };
    next();
  } catch {
    next(new UnauthorizedError("Invalid or expired token"));
  }
}
