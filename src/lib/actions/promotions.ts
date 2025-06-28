'use server';

import { nanoid } from 'nanoid';
import { 
  cosmosDB, 
  containerProducts, 
  containerProductsOrder,
  containerPromotionGroups,
  containerProductPromotions
} from '@/db';
import { 
  PromotionGroup, 
  CreatePromotionGroup, 
  UpdatePromotionGroup, 
  ProductPromotionAssignment,
  BulkProductPromotionAssignment,
  CreatePromotionGroupSchema,
  UpdatePromotionGroupSchema,
  BulkProductPromotionAssignmentSchema,
  ProductWithPromotion
} from '@/lib/utils/schemas/promotion-schema';
import { getCurrentSession } from './session';
import { logger } from '@/lib/logger';
import { revalidatePath } from 'next/cache';

// Helper function to verify store ownership
async function verifyStoreOwnership(storeId: string): Promise<boolean> {
  try {
    const { stores } = await getCurrentSession();
    if (!stores || stores.length === 0) {
      return false;
    }
    return stores.some(store => store.id === storeId);
  } catch (error) {
    logger.error('Error verifying store ownership:', error instanceof Error ? error.message : String(error));
    return false;
  }
}

// Get all promotion groups for a store
export async function getPromotionGroups(storeId: string): Promise<{ success: boolean; data?: PromotionGroup[]; error?: string }> {
  try {
  
    if (!await verifyStoreOwnership(storeId)) {
      return { success: false, error: 'Unauthorized' };
    }

    const { resources } = await containerPromotionGroups.items
      .query({
        query: 'SELECT * FROM c WHERE c.storeId = @storeId ORDER BY c.createdAt DESC',
        parameters: [{ name: '@storeId', value: storeId }]
      })
      .fetchAll();

    return { success: true, data: resources };
  } catch (error) {
    logger.error('Error fetching promotion groups:', error instanceof Error ? error.message : String(error));
    return { success: false, error: 'Failed to fetch promotion groups' };
  }
}

// Get a single promotion group
export async function getPromotionGroup(storeId: string, promotionGroupId: string): Promise<{ success: boolean; data?: PromotionGroup; error?: string }> {
  try {
    // Verify ownership
    if (!await verifyStoreOwnership(storeId)) {
      return { success: false, error: 'Unauthorized' };
    }

    const { resource } = await containerPromotionGroups.item(promotionGroupId, storeId).read();
    
    if (!resource) {
      return { success: false, error: 'Promotion group not found' };
    }

    return { success: true, data: resource };
  } catch (error) {
    logger.error('Error fetching promotion group:', error instanceof Error ? error.message : String(error));
    return { success: false, error: 'Failed to fetch promotion group' };
  }
}

// Create a new promotion group
export async function createPromotionGroup(data: unknown): Promise<{ success: boolean; data?: PromotionGroup; error?: string }> {
  try {
    // Validate input
    const parsed = CreatePromotionGroupSchema.safeParse(data);
    if (!parsed.success) {
      return { success: false, error: 'Invalid input data' };
    }

    const input = parsed.data;

    // Verify ownership
    if (!await verifyStoreOwnership(input.storeId)) {
      return { success: false, error: 'Unauthorized' };
    }

    // Create promotion group
    const promotionGroup: PromotionGroup = {
      ...input,
      id: nanoid(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const { resource } = await containerPromotionGroups.items.create(promotionGroup);

    // Revalidate the store page
    revalidatePath(`/${input.storeId}`);
    revalidatePath(`/${input.storeId}/promotion`);

    return { success: true, data: resource };
  } catch (error) {
    logger.error('Error creating promotion group:', error instanceof Error ? error.message : String(error));
    return { success: false, error: 'Failed to create promotion group' };
  }
}

// Update an existing promotion group
export async function updatePromotionGroup(promotionGroupId: string, data: unknown): Promise<{ success: boolean; data?: PromotionGroup; error?: string }> {
  try {
    // Validate input
    const parsed = UpdatePromotionGroupSchema.safeParse(data);
    if (!parsed.success) {
      return { success: false, error: 'Invalid input data' };
    }

    const input = parsed.data;

    // Get existing promotion group to verify store ownership
    // Note: We need to query first to get the storeId since we don't have it as a parameter
    const { resources: existingResources } = await containerPromotionGroups.items
      .query({
        query: 'SELECT * FROM c WHERE c.id = @id',
        parameters: [{ name: '@id', value: promotionGroupId }]
      })
      .fetchAll();
    
    const existing = existingResources[0];
    if (!existing) {
      return { success: false, error: 'Promotion group not found' };
    }

    // Verify ownership
    if (!await verifyStoreOwnership(existing.storeId)) {
      return { success: false, error: 'Unauthorized' };
    }

    // Update promotion group
    const updated: PromotionGroup = {
      ...existing,
      ...input,
      id: promotionGroupId,
      updatedAt: new Date().toISOString(),
    };

    const { resource } = await containerPromotionGroups.item(promotionGroupId, existing.storeId).replace(updated);

    // Revalidate the store page
    revalidatePath(`/${existing.storeId}`);
    revalidatePath(`/${existing.storeId}/promotion`);

    return { success: true, data: resource };
  } catch (error) {
    logger.error('Error updating promotion group:', error instanceof Error ? error.message : String(error));
    return { success: false, error: 'Failed to update promotion group' };
  }
}

// Delete a promotion group
export async function deletePromotionGroup(storeId: string, promotionGroupId: string): Promise<{ success: boolean; error?: string }> {
  try {
    // Verify ownership
    if (!await verifyStoreOwnership(storeId)) {
      return { success: false, error: 'Unauthorized' };
    }

    // Remove all product assignments for this promotion group
    const { resources: assignments } = await containerProductPromotions.items
      .query({
        query: 'SELECT * FROM c WHERE c.storeId = @storeId AND c.promotionGroupId = @promotionGroupId',
        parameters: [
          { name: '@storeId', value: storeId },
          { name: '@promotionGroupId', value: promotionGroupId }
        ]
      })
      .fetchAll();

    // Delete all assignments
    for (const assignment of assignments) {
      await containerProductPromotions.item(assignment.id, storeId).delete();
    }

    // Delete the promotion group
    await containerPromotionGroups.item(promotionGroupId, storeId).delete();

    // Revalidate the store page
    revalidatePath(`/${storeId}`);
    revalidatePath(`/${storeId}/promotion`);

    return { success: true };
  } catch (error) {
    logger.error('Error deleting promotion group:', error instanceof Error ? error.message : String(error));
    return { success: false, error: 'Failed to delete promotion group' };
  }
}

// Get all product promotion assignments for a store
export async function getProductPromotionAssignments(storeId: string): Promise<{ success: boolean; data?: ProductPromotionAssignment[]; error?: string }> {
  try {
    // Verify ownership
    if (!await verifyStoreOwnership(storeId)) {
      return { success: false, error: 'Unauthorized' };
    }

    const { resources } = await containerProductPromotions.items
      .query({
        query: 'SELECT * FROM c WHERE c.storeId = @storeId',
        parameters: [{ name: '@storeId', value: storeId }]
      })
      .fetchAll();

    return { success: true, data: resources };
  } catch (error) {
    logger.error('Error fetching product promotion assignments:', error instanceof Error ? error.message : String(error));
    return { success: false, error: 'Failed to fetch product promotion assignments' };
  }
}

// Update product promotion assignments in bulk
export async function updateProductPromotionAssignments(data: unknown): Promise<{ success: boolean; error?: string }> {
  try {
    // Validate input
    const parsed = BulkProductPromotionAssignmentSchema.safeParse(data);
    if (!parsed.success) {
      return { success: false, error: 'Invalid input data' };
    }

    const { storeId, assignments } = parsed.data;

    // Verify ownership
    if (!await verifyStoreOwnership(storeId)) {
      return { success: false, error: 'Unauthorized' };
    }

    // Get existing assignments
    const { resources: existingAssignments } = await containerProductPromotions.items
      .query({
        query: 'SELECT * FROM c WHERE c.storeId = @storeId',
        parameters: [{ name: '@storeId', value: storeId }]
      })
      .fetchAll();

    // Create a map of existing assignments by productId
    const existingMap = new Map(existingAssignments.map(a => [a.productId, a]));

    // Process each assignment
    for (const assignment of assignments) {
      const existing = existingMap.get(assignment.productId);
      
      if (assignment.promotionGroupId === null) {
        // Remove assignment if it exists
        if (existing) {
          await containerProductPromotions.item(existing.id, storeId).delete();
        }
      } else {
        // Create or update assignment
        const assignmentData = {
          id: existing?.id || nanoid(),
          storeId,
          ...assignment,
          updatedAt: new Date().toISOString(),
        };

        if (existing) {
          await containerProductPromotions.item(existing.id, storeId).replace(assignmentData);
        } else {
          await containerProductPromotions.items.create({
            ...assignmentData,
            createdAt: new Date().toISOString(),
          });
        }
      }
    }

    // Revalidate the store page
    revalidatePath(`/${storeId}`);
    revalidatePath(`/${storeId}/promotion`);

    return { success: true };
  } catch (error) {
    logger.error('Error updating product promotion assignments:', error instanceof Error ? error.message : String(error));
    return { success: false, error: 'Failed to update product promotion assignments' };
  }
}

// Get products with their promotion information
export async function getProductsWithPromotions(storeId: string): Promise<{ success: boolean; data?: ProductWithPromotion[]; error?: string }> {
  try {
    // Verify ownership
    if (!await verifyStoreOwnership(storeId)) {
      return { success: false, error: 'Unauthorized' };
    }

    // Get all products
    const { resources: products } = await containerProducts.items
      .query({
        query: 'SELECT * FROM c WHERE c.storeId = @storeId',
        parameters: [{ name: '@storeId', value: storeId }]
      })
      .fetchAll();

    // Get all promotion assignments
    const { resources: assignments } = await containerProductPromotions.items
      .query({
        query: 'SELECT * FROM c WHERE c.storeId = @storeId',
        parameters: [{ name: '@storeId', value: storeId }]
      })
      .fetchAll();

    // Get all promotion groups
    const { resources: promotionGroups } = await containerPromotionGroups.items
      .query({
        query: 'SELECT * FROM c WHERE c.storeId = @storeId',
        parameters: [{ name: '@storeId', value: storeId }]
      })
      .fetchAll();

    // Create maps for quick lookup
    const assignmentMap = new Map(assignments.map(a => [a.productId, a.promotionGroupId]));
    const promotionGroupMap = new Map(promotionGroups.map(g => [g.id, g]));

    // Combine data
    const productsWithPromotions: ProductWithPromotion[] = products.map(product => {
      const promotionGroupId = assignmentMap.get(product.id) || null;
      const promotionGroup = promotionGroupId ? promotionGroupMap.get(promotionGroupId) || null : null;

      return {
        id: product.id,
        name: product.name,
        price: product.price,
        categoryId: product.categoryId,
        promotionGroupId,
        promotionGroup,
      };
    });

    return { success: true, data: productsWithPromotions };
  } catch (error) {
    logger.error('Error fetching products with promotions:', error instanceof Error ? error.message : String(error));
    return { success: false, error: 'Failed to fetch products with promotions' };
  }
}