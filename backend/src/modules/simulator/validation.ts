import { z } from "zod";

export const startSimulatorSchema = z.object({
  mode: z.literal("burst").default("burst"),
  eventCount: z.union([z.literal(5), z.literal(10)]),
  delayMs: z.union([z.literal(500), z.literal(1000), z.literal(2000)]).default(1000),
  productIds: z.array(z.string().uuid()).min(1).optional(),
  autoSeed: z.boolean().default(true),
});

export type StartSimulatorInput = z.infer<typeof startSimulatorSchema>;
