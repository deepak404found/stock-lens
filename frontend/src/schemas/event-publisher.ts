import { z } from "zod";

export const eventPublisherSchema = z.discriminatedUnion("eventType", [
  z.object({
    eventType: z.literal("PURCHASE"),
    productId: z.string().uuid("Select a product"),
    quantity: z.number().int().positive("Quantity must be at least 1"),
    unitPrice: z.number().positive("Unit price must be positive"),
  }),
  z.object({
    eventType: z.literal("SALE"),
    productId: z.string().uuid("Select a product"),
    quantity: z.number().int().positive("Quantity must be at least 1"),
  }),
]);

export type EventPublisherFormValues = z.infer<typeof eventPublisherSchema>;
