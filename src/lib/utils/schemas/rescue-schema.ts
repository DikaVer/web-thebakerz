import * as z from 'zod';

export const RescueDealSchema = z.object({
  isActive: z.boolean(),
  products: z.array(z.object({
    id: z.string(),
    promotionPercent: z.number().min(10).max(80).refine(val => [10, 15, 25, 30, 40, 50, 60, 75, 80].includes(val)),
    quantity: z.number().min(1).int(),
    isSelected: z.boolean().optional().default(false)
  })).optional().default([])
});

export type RescueDealType = z.infer<typeof RescueDealSchema>;
