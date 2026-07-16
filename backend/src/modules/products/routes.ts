import { Router } from "express";
import { asyncHandler } from "../../middleware/async-handler.js";
import { authenticate } from "../../middleware/authenticate.js";
import { validate } from "../../middleware/validate.js";
import { productsController } from "./controller.js";
import { productIdParamsSchema } from "./validation.js";

const productsRoutes = Router();

productsRoutes.get("/", authenticate, asyncHandler(productsController.list));
productsRoutes.get(
  "/:productId/batches",
  authenticate,
  validate(productIdParamsSchema, "params"),
  asyncHandler(productsController.batches),
);

export { productsRoutes };
