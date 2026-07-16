import { Router } from "express";
import { asyncHandler } from "../../middleware/async-handler.js";
import { authenticate } from "../../middleware/authenticate.js";
import { validate } from "../../middleware/validate.js";
import { eventsController } from "./controller.js";
import { createEventSchema } from "./validation.js";

const eventsRoutes = Router();

eventsRoutes.post(
  "/",
  authenticate,
  validate(createEventSchema),
  asyncHandler(eventsController.create),
);

export { eventsRoutes };
