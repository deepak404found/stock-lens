import { Router } from "express";
import { asyncHandler } from "../../middleware/async-handler.js";
import { authenticate } from "../../middleware/authenticate.js";
import { validate } from "../../middleware/validate.js";
import { authController } from "./controller.js";
import { loginSchema } from "./validation.js";

const authRoutes = Router();

authRoutes.post("/login", validate(loginSchema), asyncHandler(authController.login));

authRoutes.post("/logout", asyncHandler(authController.logout));

authRoutes.get("/me", authenticate, asyncHandler(authController.me));

export { authRoutes };
