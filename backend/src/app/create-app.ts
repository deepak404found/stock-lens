import cookieParser from "cookie-parser";
import cors from "cors";
import express from "express";
import { env } from "../config/env.js";
import { errorHandler } from "../middleware/error-handler.js";
import { authRoutes } from "../modules/auth/routes.js";
import { productsRoutes } from "../modules/products/routes.js";
import { sendSuccess } from "../shared/api-response.js";

export function createApp() {
  const app = express();

  app.use(
    cors({
      origin: env.CORS_ORIGIN,
      credentials: true,
    }),
  );
  app.use(express.json());
  app.use(cookieParser());

  app.get("/health", (_req, res) => {
    sendSuccess(res, { status: "ok" }, "Healthy");
  });

  const api = express.Router();
  api.use("/auth", authRoutes);
  api.use("/products", productsRoutes);
  app.use("/api/v1", api);

  app.use(errorHandler);

  return app;
}
