import type { Producer } from "kafkajs";
import { env } from "../../config/env.js";
import { logger } from "../../config/logger.js";
import { createKafkaClient } from "./client.js";

const kafka = createKafkaClient("stocklens-producer");
import type { InventoryEventPayload } from "./types.js";

let producer: Producer | null = null;
let connected = false;

export async function connectProducer(): Promise<void> {
  if (connected && producer) return;
  producer = kafka.producer();
  await producer.connect();
  connected = true;
  logger.info("Kafka producer connected");
}

export async function disconnectProducer(): Promise<void> {
  if (!producer) return;
  await producer.disconnect();
  producer = null;
  connected = false;
  logger.info("Kafka producer disconnected");
}

export async function publishInventoryEvent(payload: InventoryEventPayload): Promise<void> {
  if (!producer || !connected) {
    await connectProducer();
  }

  await producer!.send({
    topic: env.KAFKA_TOPIC_INVENTORY_EVENTS,
    messages: [
      {
        key: payload.eventId,
        value: JSON.stringify(payload),
      },
    ],
  });

  logger.info(
    {
      eventId: payload.eventId,
      eventType: payload.eventType,
      topic: env.KAFKA_TOPIC_INVENTORY_EVENTS,
    },
    "Published inventory event",
  );
}

export function isProducerConnected(): boolean {
  return connected;
}
