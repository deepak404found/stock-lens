import { z } from "zod";

export const createEventSchema = z.discriminatedUnion("eventType", [
  z
    .object({
      eventType: z.literal("PURCHASE"),
      productId: z.string().uuid(),
      quantity: z.number().int().positive(),
      unitPrice: z.number().positive(),
    })
    .strict(),
  z
    .object({
      eventType: z.literal("SALE"),
      productId: z.string().uuid(),
      quantity: z.number().int().positive(),
    })
    .strict(),
]);

export type CreateEventInput = z.infer<typeof createEventSchema>;
