import type { Server as HttpServer } from "node:http";
import { Server } from "socket.io";
import { env } from "../config/env.js";
import { logger } from "../config/logger.js";

let io: Server | null = null;

export function initSocketServer(httpServer: HttpServer): Server {
  io = new Server(httpServer, {
    cors: {
      origin: env.CORS_ORIGIN,
      credentials: true,
    },
  });

  io.on("connection", (socket) => {
    logger.debug({ socketId: socket.id }, "Socket client connected");
    socket.on("disconnect", () => {
      logger.debug({ socketId: socket.id }, "Socket client disconnected");
    });
  });

  logger.info("Socket.IO server initialized");
  return io;
}

export function getSocketServer(): Server | null {
  return io;
}

export async function closeSocketServer(): Promise<void> {
  if (!io) return;
  await new Promise<void>((resolve) => {
    io!.close(() => resolve());
  });
  io = null;
  logger.info("Socket.IO server closed");
}
