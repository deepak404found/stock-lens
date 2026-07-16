import { api, type ApiSuccess } from "@/lib/api";
import type { EventType } from "@/types/inventory";

export type PublishPurchaseInput = {
  eventType: "PURCHASE";
  productId: string;
  quantity: number;
  unitPrice: number;
};

export type PublishSaleInput = {
  eventType: "SALE";
  productId: string;
  quantity: number;
};

export type PublishEventInput = PublishPurchaseInput | PublishSaleInput;

export async function publishEvent(input: PublishEventInput): Promise<{ eventId: string }> {
  const { data } = await api.post<ApiSuccess<{ eventId: string }>>("/api/v1/events", input);
  return data.data;
}

export type { EventType };
