/**
 * @fileoverview Zod schema for store rescue deal configuration.
 *
 * Exports RescueDealSchema, which validates an active flag and a list of
 * products each carrying a discount percentage restricted to preset values
 * (10-80%), an integer quantity, and a selection flag, plus the inferred
 * RescueDealType. Rescue deals offer discounted products to reduce food waste.
 */
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
