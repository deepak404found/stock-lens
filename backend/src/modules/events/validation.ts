import { z } from "zod";

export const createEventSchema = z.object({
  eventType: z.enum(["PURCHASE", "SALE"]),
  productId: z.string().uuid(),
  quantity: z.number().int().positive(),
  unitPrice: z.number().positive(),
});

export type CreateEventInput = z.infer<typeof createEventSchema>;
