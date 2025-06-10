import * as z from 'zod';

export const RescueDealSchema = z.object({
  beforeTime: z.number().min(15).max(120), // minutes: 15, 30, 45, 60, 90, 120
  startTime: z.object({
    hour: z.number().min(0).max(23),
    minute: z.number().min(0).max(45).refine(val => [0, 15, 30, 45].includes(val))
  }),
  endTime: z.object({
    hour: z.number().min(0).max(23),
    minute: z.number().min(0).max(45).refine(val => [0, 15, 30, 45].includes(val))
  }),
  isActive: z.boolean(),
  products: z.array(z.object({
    id: z.string(),
    promotionPercent: z.number().min(10).max(80).refine(val => [10, 15, 25, 30, 40, 50, 60, 75, 80].includes(val)),
    quantity: z.number().min(1).int()
  })).optional().default([])
});

export type RescueDealType = z.infer<typeof RescueDealSchema>;
