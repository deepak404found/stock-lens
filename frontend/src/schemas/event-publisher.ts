import { z } from "zod";

export const eventPublisherSchema = z.object({
  eventType: z.enum(["PURCHASE", "SALE"]),
  productId: z.string().uuid("Select a product"),
  quantity: z.number().int().positive("Quantity must be at least 1"),
  unitPrice: z.number().positive("Unit price must be positive"),
});

export type EventPublisherFormValues = z.infer<typeof eventPublisherSchema>;
