import type { Request, Response } from "express";
import { env } from "../../config/env.js";
import { sendSuccess } from "../../shared/api-response.js";
import type { AuthenticatedRequest } from "../../shared/types.js";
import { authService } from "./service.js";
import type { LoginInput } from "./validation.js";

function cookieOptions() {
  return {
    httpOnly: true,
    secure: env.NODE_ENV === "production",
    sameSite: "lax" as const,
    maxAge: 7 * 24 * 60 * 60 * 1000,
    path: "/",
  };
}

export class AuthController {
  login = async (req: Request, res: Response) => {
    const result = await authService.login(req.body as LoginInput);
    res.cookie(env.COOKIE_NAME, result.token, cookieOptions());
    return sendSuccess(res, { user: result.user }, "Login successful");
  };

  logout = async (_req: Request, res: Response) => {
    res.clearCookie(env.COOKIE_NAME, {
      httpOnly: true,
      secure: env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
    });
    return sendSuccess(res, null, "Logout successful");
  };

  me = async (req: Request, res: Response) => {
    const { user } = req as AuthenticatedRequest;
    const me = await authService.getMe(user.id);
    return sendSuccess(res, { user: me }, "Success");
  };
}

export const authController = new AuthController();
