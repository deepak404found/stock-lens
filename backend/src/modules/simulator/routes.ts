import { Router } from "express";
import { asyncHandler } from "../../middleware/async-handler.js";
import { authenticate } from "../../middleware/authenticate.js";
import { validate } from "../../middleware/validate.js";
import { simulatorController } from "./controller.js";
import { startSimulatorSchema } from "./validation.js";

const simulatorRoutes = Router();

simulatorRoutes.post(
  "/start",
  authenticate,
  validate(startSimulatorSchema),
  asyncHandler(simulatorController.start),
);
simulatorRoutes.post("/stop", authenticate, asyncHandler(simulatorController.stop));
simulatorRoutes.get("/status", authenticate, asyncHandler(simulatorController.status));

export { simulatorRoutes };
