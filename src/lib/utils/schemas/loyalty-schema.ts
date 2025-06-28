import { z } from "zod";

// Loyalty Tier Names Enum
export const LoyaltyTierNameEnum = z.enum(["Bronze", "Silver", "Gold", "Platinum"]);
export type LoyaltyTierName = z.infer<typeof LoyaltyTierNameEnum>;

// Individual Loyalty Tier Schema
export const LoyaltyTierSchema = z.object({
  tierName: LoyaltyTierNameEnum,
  spendingThreshold: z.number().min(0), // Amount in cents to reach this tier
  discountPercentage: z.number().min(0).max(100), // Discount percentage for this tier
});

// Loyalty Settings Schema for a store
export const LoyaltySettingsSchema = z.object({
  userId: z.string(),
  id: z.string().optional(), // Generated on server
  isActive: z.boolean().default(true),
  tiers: z.array(LoyaltyTierSchema).length(4), // Exactly 4 tiers: Bronze, Silver, Gold, Platinum
  createdAt: z.string().datetime().optional(),
  updatedAt: z.string().datetime().optional(),
});

// Create/Update Loyalty Settings Input Schema
export const CreateLoyaltySettingsSchema = LoyaltySettingsSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const UpdateLoyaltySettingsSchema = LoyaltySettingsSchema.omit({
  userId: true,
  createdAt: true,
  updatedAt: true,
});

// Default tier configuration
export const defaultLoyaltyTiers: LoyaltyTier[] = [
  {
    tierName: "Bronze",
    spendingThreshold: 0, // €0 - everyone starts here
    discountPercentage: 0, // No discount for Bronze
  },
  {
    tierName: "Silver",
    spendingThreshold: 10000, // €100 in cents
    discountPercentage: 5, // 5% discount
  },
  {
    tierName: "Gold",
    spendingThreshold: 25000, // €250 in cents
    discountPercentage: 10, // 10% discount
  },
  {
    tierName: "Platinum",
    spendingThreshold: 50000, // €500 in cents
    discountPercentage: 15, // 15% discount
  },
];

// Validation to ensure tiers are in ascending order of spending thresholds
export const ValidatedLoyaltySettingsSchema = LoyaltySettingsSchema.refine(
  (data) => {
    const sortedTiers = [...data.tiers].sort((a, b) => a.spendingThreshold - b.spendingThreshold);
    return data.tiers.every((tier, index) => 
      tier.spendingThreshold === sortedTiers[index].spendingThreshold
    );
  },
  {
    message: "Tiers must be ordered by spending threshold (lowest to highest)",
    path: ["tiers"],
  }
).refine(
  (data) => {
    // Ensure we have exactly one of each tier type
    const tierNames = data.tiers.map(t => t.tierName);
    const expectedTiers = ["Bronze", "Silver", "Gold", "Platinum"];
    return expectedTiers.every(name => tierNames.includes(name as LoyaltyTierName));
  },
  {
    message: "Must include exactly one Bronze, Silver, Gold, and Platinum tier",
    path: ["tiers"],
  }
);

// Customer Loyalty Status Schema (for tracking individual customer progress)
export const CustomerLoyaltyStatusSchema = z.object({
  id: z.string().optional(),
  customerId: z.string(), // Could be email or user ID
  storeId: z.string(),
  currentTier: LoyaltyTierNameEnum,
  totalSpent: z.number().min(0), // Total amount spent in cents across all orders
  nextTierThreshold: z.number().optional(), // Amount needed to reach next tier
  createdAt: z.string().datetime().optional(),
  updatedAt: z.string().datetime().optional(),
});

// Loyalty Item Type Enum
export const LoyaltyItemTypeEnum = z.enum(["buyXGetYFree", "percentageDiscount", "fixedAmountDiscount"]);
export type LoyaltyItemType = z.infer<typeof LoyaltyItemTypeEnum>;

// Individual Loyalty Item Schema
export const LoyaltyItemSchema = z.object({
  id: z.string().optional(), // Generated on server
  userId: z.string(),
  title: z.string().min(1).max(100),
  description: z.string().optional(),
  type: LoyaltyItemTypeEnum,
  price: z.number().min(0), // Price in cents to purchase this loyalty item
  isActive: z.boolean().default(true),
  
  // Type-specific configuration
  buyQuantity: z.number().min(1).optional(), // For buyXGetYFree type
  getQuantity: z.number().min(1).optional(), // For buyXGetYFree type
  discountPercentage: z.number().min(0).max(100).optional(), // For percentageDiscount type
  discountAmount: z.number().min(0).optional(), // For fixedAmountDiscount type (in cents)
  
  // Product application
  applyToAllProducts: z.boolean().default(true),
  
  createdAt: z.string().datetime().optional(),
  updatedAt: z.string().datetime().optional(),
});

// Validate loyalty item based on type
export const ValidatedLoyaltyItemSchema = LoyaltyItemSchema.refine(
  (data) => {
    if (data.type === "buyXGetYFree") {
      return data.buyQuantity !== undefined && data.getQuantity !== undefined;
    }
    if (data.type === "percentageDiscount") {
      return data.discountPercentage !== undefined;
    }
    if (data.type === "fixedAmountDiscount") {
      return data.discountAmount !== undefined;
    }
    return true;
  },
  {
    message: "Required fields for the selected loyalty item type are missing",
    path: ["type"],
  }
);

// Create/Update Loyalty Item Input Schemas
export const CreateLoyaltyItemSchema = LoyaltyItemSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const UpdateLoyaltyItemSchema = LoyaltyItemSchema.omit({
  userId: true,
  createdAt: true,
  updatedAt: true,
});

// Product Loyalty Item Assignment Schema
export const ProductLoyaltyItemAssignmentSchema = z.object({
  productId: z.string(),
  loyaltyItemId: z.string().nullable(), // null means no loyalty item assigned
});

// Bulk Product Loyalty Item Assignment Schema
export const BulkProductLoyaltyItemAssignmentSchema = z.object({
  storeId: z.string(),
  assignments: z.array(ProductLoyaltyItemAssignmentSchema),
});

// Loyalty Item with assignment info (for display)
export const LoyaltyItemWithAssignmentSchema = z.object({
  ...LoyaltyItemSchema.shape,
  assignedProductCount: z.number().optional(),
});

// Export types
export type LoyaltyTier = z.infer<typeof LoyaltyTierSchema>;
export type LoyaltySettings = z.infer<typeof LoyaltySettingsSchema>;
export type CreateLoyaltySettings = z.infer<typeof CreateLoyaltySettingsSchema>;
export type UpdateLoyaltySettings = z.infer<typeof UpdateLoyaltySettingsSchema>;
export type ValidatedLoyaltySettings = z.infer<typeof ValidatedLoyaltySettingsSchema>;
export type CustomerLoyaltyStatus = z.infer<typeof CustomerLoyaltyStatusSchema>;
export type LoyaltyItem = z.infer<typeof LoyaltyItemSchema>;
export type ValidatedLoyaltyItem = z.infer<typeof ValidatedLoyaltyItemSchema>;
export type CreateLoyaltyItem = z.infer<typeof CreateLoyaltyItemSchema>;
export type UpdateLoyaltyItem = z.infer<typeof UpdateLoyaltyItemSchema>;
export type ProductLoyaltyItemAssignment = z.infer<typeof ProductLoyaltyItemAssignmentSchema>;
export type BulkProductLoyaltyItemAssignment = z.infer<typeof BulkProductLoyaltyItemAssignmentSchema>;
export type LoyaltyItemWithAssignment = z.infer<typeof LoyaltyItemWithAssignmentSchema>;