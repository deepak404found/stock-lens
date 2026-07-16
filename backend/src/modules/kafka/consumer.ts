import type { Consumer, EachMessagePayload } from "kafkajs";
import { env } from "../../config/env.js";
import { logger } from "../../config/logger.js";
import { createKafkaClient } from "./client.js";

const kafka = createKafkaClient("stocklens-consumer");

export type MessageHandler = (payload: EachMessagePayload) => Promise<void>;

let consumer: Consumer | null = null;
let running = false;

export async function startConsumer(handler: MessageHandler): Promise<void> {
  if (running) return;

  consumer = kafka.consumer({ groupId: env.KAFKA_CONSUMER_GROUP });
  await consumer.connect();
  await consumer.subscribe({
    topic: env.KAFKA_TOPIC_INVENTORY_EVENTS,
    fromBeginning: false,
  });

  await consumer.run({
    eachMessage: async (payload) => {
      try {
        await handler(payload);
      } catch (err) {
        logger.error(
          { err, topic: payload.topic, offset: payload.message.offset },
          "Consumer handler failed",
        );
      }
    },
  });

  running = true;
  logger.info(
    { topic: env.KAFKA_TOPIC_INVENTORY_EVENTS, group: env.KAFKA_CONSUMER_GROUP },
    "Kafka consumer joined group",
  );
}

export async function stopConsumer(): Promise<void> {
  if (!consumer) return;
  await consumer.disconnect();
  consumer = null;
  running = false;
  logger.info("Kafka consumer disconnected");
}

export function isConsumerRunning(): boolean {
  return running;
}
