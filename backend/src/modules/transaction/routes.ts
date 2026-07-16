import { Router } from "express";
import { asyncHandler } from "../../middleware/async-handler.js";
import { authenticate } from "../../middleware/authenticate.js";
import { validate } from "../../middleware/validate.js";
import { transactionController } from "./controller.js";
import { listTransactionsQuerySchema } from "./validation.js";

const transactionRoutes = Router();

transactionRoutes.get(
  "/",
  authenticate,
  validate(listTransactionsQuerySchema, "query"),
  asyncHandler(transactionController.list),
);

export { transactionRoutes };
