import { Router } from "express";
import { asyncHandler } from "../../middleware/async-handler.js";
import { authenticate } from "../../middleware/authenticate.js";
import { productsController } from "./controller.js";

const productsRoutes = Router();

productsRoutes.get("/", authenticate, asyncHandler(productsController.list));

export { productsRoutes };
