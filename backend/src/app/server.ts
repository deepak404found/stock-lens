import { createApp } from "./create-app.js";
import { env } from "../config/env.js";
import { logger } from "../config/logger.js";
import { connectProducer, disconnectProducer } from "../modules/kafka/producer.js";
import { startConsumer, stopConsumer } from "../modules/kafka/consumer.js";
import { eventProcessorService } from "../modules/inventory/event-processor.service.js";
import { initSocketServer, closeSocketServer } from "../websocket/socket-server.js";
import { createServer } from "node:http";

const app = createApp();
const httpServer = createServer(app);

initSocketServer(httpServer);

async function bootstrap() {
  httpServer.listen(env.PORT, () => {
    logger.info({ port: env.PORT, env: env.NODE_ENV }, "StockLens API listening");
  });

  await connectProducer();
  await startConsumer((payload) => eventProcessorService.handleMessage(payload));
  logger.info("Kafka producer and consumer ready");
}

function shutdown(signal: string) {
  logger.info({ signal }, "Shutting down");

  void (async () => {
    await stopConsumer();
    await disconnectProducer();
    await closeSocketServer();

    httpServer.close(() => {
      process.exit(0);
    });
  })();
}

bootstrap().catch((err) => {
  logger.error({ err }, "Failed to start server");
  process.exit(1);
});

process.on("SIGINT", () => shutdown("SIGINT"));
process.on("SIGTERM", () => shutdown("SIGTERM"));
