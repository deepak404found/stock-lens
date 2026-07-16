import { Router } from "express";
import { asyncHandler } from "../../middleware/async-handler.js";
import { authenticate } from "../../middleware/authenticate.js";
import { dashboardController } from "./controller.js";

const dashboardRoutes = Router();

dashboardRoutes.get("/", authenticate, asyncHandler(dashboardController.get));

export { dashboardRoutes };
