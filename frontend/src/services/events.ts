import { api, type ApiSuccess } from "@/lib/api";
import type { EventType } from "@/types/inventory";

export type PublishEventInput = {
  eventType: EventType;
  productId: string;
  quantity: number;
  unitPrice: number;
};

export async function publishEvent(input: PublishEventInput): Promise<{ eventId: string }> {
  const { data } = await api.post<ApiSuccess<{ eventId: string }>>("/api/v1/events", input);
  return data.data;
}
