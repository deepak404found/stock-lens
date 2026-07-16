import { z } from "zod";

export const listTransactionsQuerySchema = z.object({
  limit: z.coerce.number().int().positive().max(100).default(10),
  offset: z.coerce.number().int().min(0).default(0),
});

export type ListTransactionsQuery = z.infer<typeof listTransactionsQuerySchema>;
