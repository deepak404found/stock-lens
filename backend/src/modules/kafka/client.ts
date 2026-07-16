import { Kafka, logLevel } from "kafkajs";
import { env } from "../../config/env.js";
import { logger } from "../../config/logger.js";

const logCreator =
  () =>
  ({
    namespace,
    level,
    log,
  }: {
    namespace: string;
    level: number;
    log: Record<string, unknown>;
  }) => {
    const { message, ...extra } = log;
    if (level >= logLevel.ERROR) {
      logger.error({ namespace, ...extra }, String(message));
    }
  };

/**
 * Redpanda Cloud requires separate KafkaJS clients for producer and consumer.
 * Sharing one client causes broker connection races ("write after end").
 */
export function createKafkaClient(clientId: string): Kafka {
  return new Kafka({
    clientId,
    brokers: env.KAFKA_BROKERS,
    // Redpanda Cloud: empty object enables TLS with system CAs (Let's Encrypt)
    ssl: env.KAFKA_SSL ? {} : false,
    sasl: {
      mechanism: "scram-sha-256",
      username: env.KAFKA_USERNAME,
      password: env.KAFKA_PASSWORD,
    },
    connectionTimeout: 30_000,
    authenticationTimeout: 30_000,
    requestTimeout: 30_000,
    retry: {
      initialRetryTime: 300,
      retries: 10,
      maxRetryTime: 30_000,
    },
    logLevel: logLevel.ERROR,
    logCreator,
  });
}
