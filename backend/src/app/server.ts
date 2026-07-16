import { createApp } from "./create-app.js";
import { env } from "../config/env.js";
import { logger } from "../config/logger.js";

const app = createApp();

const server = app.listen(env.PORT, () => {
  logger.info({ port: env.PORT, env: env.NODE_ENV }, "StockLens API listening");
});

function shutdown(signal: string) {
  logger.info({ signal }, "Shutting down");
  server.close(() => {
    process.exit(0);
  });
}

process.on("SIGINT", () => shutdown("SIGINT"));
process.on("SIGTERM", () => shutdown("SIGTERM"));
