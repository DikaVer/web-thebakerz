import { z } from "zod";

// Promotion Type Enum
export const PromotionTypeEnum = z.enum(["discount", "buyGetFree"]);
export type PromotionType = z.infer<typeof PromotionTypeEnum>;

// Discount Promotion Schema
export const DiscountPromotionSchema = z.object({
  type: z.literal("discount"),
  percentage: z.number().min(1).max(99),
  description: z.string().optional(), // e.g., "43% Off"
});

// Buy/Get Free Promotion Schema
export const BuyGetFreePromotionSchema = z.object({
  type: z.literal("buyGetFree"),
  buyQuantity: z.number().min(1),
  getQuantity: z.number().min(1),
  description: z.string().optional(), // e.g., "Buy 1 Get 1 Free"
});

// Union of promotion details
export const PromotionDetailsSchema = z.discriminatedUnion("type", [
  DiscountPromotionSchema,
  BuyGetFreePromotionSchema,
]);

// Promotion Group Schema
export const PromotionGroupSchema = z.object({
  id: z.string().optional(), // Generated on server
  storeId: z.string(),
  name: z.string().min(1).max(100),
  description: z.string().optional(),
  promotionDetails: PromotionDetailsSchema,
  isActive: z.boolean().default(true),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  createdAt: z.string().datetime().optional(),
  updatedAt: z.string().datetime().optional(),
});

// Product Assignment Schema
export const ProductPromotionAssignmentSchema = z.object({
  productId: z.string(),
  promotionGroupId: z.string().nullable(), // null means no promotion
});

// Bulk Product Assignment Schema
export const BulkProductPromotionAssignmentSchema = z.object({
  storeId: z.string(),
  assignments: z.array(ProductPromotionAssignmentSchema),
});

// Create/Update Promotion Group Input Schema
export const CreatePromotionGroupSchema = PromotionGroupSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const UpdatePromotionGroupSchema = PromotionGroupSchema.omit({
  storeId: true,
  createdAt: true,
  updatedAt: true,
});

// Product with promotion info (for display)
export const ProductWithPromotionSchema = z.object({
  id: z.string(),
  name: z.string(),
  price: z.number(),
  categoryId: z.string(),
  promotionGroupId: z.string().nullable(),
  promotionGroup: PromotionGroupSchema.nullable(),
});

// Store Promotions Settings Schema (for saving all at once)
export const StorePromotionsSettingsSchema = z.object({
  storeId: z.string(),
  promotionGroups: z.array(PromotionGroupSchema),
  productAssignments: z.array(ProductPromotionAssignmentSchema),
});

// Export types
export type DiscountPromotion = z.infer<typeof DiscountPromotionSchema>;
export type BuyGetFreePromotion = z.infer<typeof BuyGetFreePromotionSchema>;
export type PromotionDetails = z.infer<typeof PromotionDetailsSchema>;
export type PromotionGroup = z.infer<typeof PromotionGroupSchema>;
export type ProductPromotionAssignment = z.infer<typeof ProductPromotionAssignmentSchema>;
export type BulkProductPromotionAssignment = z.infer<typeof BulkProductPromotionAssignmentSchema>;
export type CreatePromotionGroup = z.infer<typeof CreatePromotionGroupSchema>;
export type UpdatePromotionGroup = z.infer<typeof UpdatePromotionGroupSchema>;
export type ProductWithPromotion = z.infer<typeof ProductWithPromotionSchema>;
export type StorePromotionsSettings = z.infer<typeof StorePromotionsSettingsSchema>;