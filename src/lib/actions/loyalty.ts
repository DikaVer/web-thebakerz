/**
 * @fileoverview Server actions for merchant loyalty program management.
 *
 * Provides CRUD actions for loyalty settings (tier configuration), loyalty
 * reward items, and bulk product-to-loyalty-item assignments, stored in the
 * Cosmos DB loyalty-settings, loyalty-items, and product-loyalty-items
 * containers. All mutations validate input with Zod schemas from
 * loyalty-schema, verify store ownership via the current session, and
 * revalidate the store and promotion pages.
 */
'use server';

import { nanoid } from 'nanoid';
import { containerLoyaltySettings, containerLoyaltyItems, containerProductLoyaltyItems } from '@/db';
import { 
  LoyaltySettings,
  CreateLoyaltySettingsSchema,
  UpdateLoyaltySettingsSchema,
  ValidatedLoyaltySettingsSchema,
  defaultLoyaltyTiers,
  LoyaltyItem,
  CreateLoyaltyItemSchema,
  UpdateLoyaltyItemSchema,
  ValidatedLoyaltyItemSchema,
  ProductLoyaltyItemAssignment,
  BulkProductLoyaltyItemAssignmentSchema,
} from '@/lib/utils/schemas/loyalty-schema';
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

// Get loyalty settings for a store
export async function getLoyaltySettings(userId: string): Promise<{ success: boolean; data?: LoyaltySettings; error?: string }> {
  try {

    const { resources } = await containerLoyaltySettings.items
      .query({
        query: 'SELECT * FROM c WHERE c.userId = @userId',
        parameters: [{ name: '@userId', value: userId }]
      })
      .fetchAll();

    if (resources.length === 0) {
      // Return default settings if none exist
      const defaultSettings: LoyaltySettings = {
        userId,
        isActive: false,
        tiers: defaultLoyaltyTiers,
      };
      return { success: true, data: defaultSettings };
    }

    return { success: true, data: resources[0] };
  } catch (error) {
    logger.error('Error fetching loyalty settings:', error instanceof Error ? error.message : String(error));
    return { success: false, error: 'Failed to fetch loyalty settings' };
  }
}

// Create or update loyalty settings
export async function saveLoyaltySettings(storeId: string, data: unknown): Promise<{ success: boolean; data?: LoyaltySettings; error?: string }> {
  try {
    // Validate input
    const parsed = CreateLoyaltySettingsSchema.safeParse(data);
    if (!parsed.success) {
      return { success: false, error: 'Invalid input data' };
    }

    const input = parsed.data;

    // Verify ownership
    if (!await verifyStoreOwnership(storeId)) {
      return { success: false, error: 'Unauthorized' };
    }

    // Additional validation with the validated schema
    const validatedData = ValidatedLoyaltySettingsSchema.safeParse({
      ...input,
      id: nanoid(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    if (!validatedData.success) {
      return { success: false, error: validatedData.error.issues[0]?.message || 'Invalid tier configuration' };
    }

    // Check if settings already exist
    const { resources: existing } = await containerLoyaltySettings.items
      .query({
        query: 'SELECT * FROM c WHERE c.userId = @userId',
        parameters: [{ name: '@userId', value: input.userId }]
      })
      .fetchAll();

    let loyaltySettings: LoyaltySettings;

    if (existing.length > 0) {
      // Update existing
      loyaltySettings = {
        ...existing[0],
        ...input,
        updatedAt: new Date().toISOString(),
      };
      const { resource } = await containerLoyaltySettings.item(existing[0].id, input.userId).replace(loyaltySettings);
      loyaltySettings = resource || loyaltySettings;
    } else {
      // Create new
      loyaltySettings = {
        ...input,
        id: nanoid(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      const { resource } = await containerLoyaltySettings.items.create(loyaltySettings);
      loyaltySettings = resource || loyaltySettings;
    }

    // Revalidate the store page
    revalidatePath(`/${storeId}`);
    revalidatePath(`/${storeId}/promotion`);

    return { success: true, data: loyaltySettings };
  } catch (error) {
    logger.error('Error saving loyalty settings:', error instanceof Error ? error.message : String(error));
    return { success: false, error: 'Failed to save loyalty settings' };
  }
}

// Update loyalty settings (for use with existing ID)
export async function updateLoyaltySettings(loyaltyId: string, data: unknown): Promise<{ success: boolean; data?: LoyaltySettings; error?: string }> {
  try {
    // Validate input
    const parsed = UpdateLoyaltySettingsSchema.safeParse(data);
    if (!parsed.success) {
      return { success: false, error: 'Invalid input data' };
    }

    const input = parsed.data;

    // Get existing loyalty settings to verify store ownership
    const { resources: existingResources } = await containerLoyaltySettings.items
      .query({
        query: 'SELECT * FROM c WHERE c.id = @id',
        parameters: [{ name: '@id', value: loyaltyId }]
      })
      .fetchAll();
    
    const existing = existingResources[0];
    if (!existing) {
      return { success: false, error: 'Loyalty settings not found' };
    }

    // Verify ownership
    if (!await verifyStoreOwnership(existing.storeId)) {
      return { success: false, error: 'Unauthorized' };
    }

    // Additional validation with the validated schema
    const validatedData = ValidatedLoyaltySettingsSchema.safeParse({
      ...existing,
      ...input,
      updatedAt: new Date().toISOString(),
    });

    if (!validatedData.success) {
      return { success: false, error: validatedData.error.issues[0]?.message || 'Invalid tier configuration' };
    }

    // Update loyalty settings
    const updated: LoyaltySettings = {
      ...existing,
      ...input,
      id: loyaltyId,
      updatedAt: new Date().toISOString(),
    };

    const { resource } = await containerLoyaltySettings.item(loyaltyId, existing.storeId).replace(updated);

    // Revalidate the store page
    revalidatePath(`/${existing.storeId}`);
    revalidatePath(`/${existing.storeId}/promotion`);

    return { success: true, data: resource };
  } catch (error) {
    logger.error('Error updating loyalty settings:', error instanceof Error ? error.message : String(error));
    return { success: false, error: 'Failed to update loyalty settings' };
  }
}

// ===== LOYALTY ITEMS ACTIONS =====

// Get all loyalty items for a store
export async function getLoyaltyItems(userId: string): Promise<{ success: boolean; data?: LoyaltyItem[]; error?: string }> {
  try {

    const { resources } = await containerLoyaltyItems.items
      .query({
        query: 'SELECT * FROM c WHERE c.userId = @userId ORDER BY c.createdAt DESC',
        parameters: [{ name: '@userId', value: userId }]
      })
      .fetchAll();

    return { success: true, data: resources };
  } catch (error) {
    logger.error('Error fetching loyalty items:', error instanceof Error ? error.message : String(error));
    return { success: false, error: 'Failed to fetch loyalty items' };
  }
}

// Get a single loyalty item
export async function getLoyaltyItem(userId: string, loyaltyItemId: string): Promise<{ success: boolean; data?: LoyaltyItem; error?: string }> {
  try {

    const { resource } = await containerLoyaltyItems.item(loyaltyItemId, userId).read();
    
    if (!resource) {
      return { success: false, error: 'Loyalty item not found' };
    }

    return { success: true, data: resource };
  } catch (error) {
    logger.error('Error fetching loyalty item:', error instanceof Error ? error.message : String(error));
    return { success: false, error: 'Failed to fetch loyalty item' };
  }
}

// Create a new loyalty item
export async function createLoyaltyItem(storeId: string, data: unknown): Promise<{ success: boolean; data?: LoyaltyItem; error?: string }> {
  try {
    // Validate input
    const parsed = CreateLoyaltyItemSchema.safeParse(data);
    if (!parsed.success) {
      return { success: false, error: 'Invalid input data' };
    }

    const input = parsed.data;

    // Verify ownership
    if (!await verifyStoreOwnership(storeId)) {
      return { success: false, error: 'Unauthorized' };
    }

    // Additional validation with the validated schema
    const validatedData = ValidatedLoyaltyItemSchema.safeParse({
      ...input,
      id: nanoid(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    if (!validatedData.success) {
      return { success: false, error: validatedData.error.issues[0]?.message || 'Invalid loyalty item configuration' };
    }

    // Create loyalty item
    const loyaltyItem: LoyaltyItem = {
      ...input,
      id: nanoid(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const { resource } = await containerLoyaltyItems.items.create(loyaltyItem);

    // Revalidate the store page
    revalidatePath(`/${storeId}`);
    revalidatePath(`/${storeId}/promotion`);

    return { success: true, data: resource };
  } catch (error) {
    logger.error('Error creating loyalty item:', error instanceof Error ? error.message : String(error));
    return { success: false, error: 'Failed to create loyalty item' };
  }
}

// Update an existing loyalty item
export async function updateLoyaltyItem(storeId: string, loyaltyItemId: string, data: unknown): Promise<{ success: boolean; data?: LoyaltyItem; error?: string }> {
  try {
    // Validate input
    const parsed = UpdateLoyaltyItemSchema.safeParse(data);
    if (!parsed.success) {
      return { success: false, error: 'Invalid input data' };
    }

    const input = parsed.data;

    // Get existing loyalty item to verify store ownership
    const { resources: existingResources } = await containerLoyaltyItems.items
      .query({
        query: 'SELECT * FROM c WHERE c.id = @id',
        parameters: [{ name: '@id', value: loyaltyItemId }]
      })
      .fetchAll();
    
    const existing = existingResources[0];
    if (!existing) {
      return { success: false, error: 'Loyalty item not found' };
    }

    // Verify ownership
    if (!await verifyStoreOwnership(storeId)) {
      return { success: false, error: 'Unauthorized' };
    }

    // Additional validation with the validated schema
    const validatedData = ValidatedLoyaltyItemSchema.safeParse({
      ...existing,
      ...input,
      updatedAt: new Date().toISOString(),
    });

    if (!validatedData.success) {
      return { success: false, error: validatedData.error.issues[0]?.message || 'Invalid loyalty item configuration' };
    }

    // Update loyalty item
    const updated: LoyaltyItem = {
      ...existing,
      ...input,
      id: loyaltyItemId,
      updatedAt: new Date().toISOString(),
    };

    const { resource } = await containerLoyaltyItems.item(loyaltyItemId, existing.userId).replace(updated);

    // Revalidate the store page
    revalidatePath(`/${storeId}`);
    revalidatePath(`/${storeId}/promotion`);

    return { success: true, data: resource };
  } catch (error) {
    logger.error('Error updating loyalty item:', error instanceof Error ? error.message : String(error));
    return { success: false, error: 'Failed to update loyalty item' };
  }
}

// Delete a loyalty item
export async function deleteLoyaltyItem(storeId: string, userId: string, loyaltyItemId: string): Promise<{ success: boolean; error?: string }> {
  try {
    // Verify ownership
    if (!await verifyStoreOwnership(storeId)) {
      return { success: false, error: 'Unauthorized' };
    }

    // Remove all product assignments for this loyalty item
    const { resources: assignments } = await containerProductLoyaltyItems.items
      .query({
        query: 'SELECT * FROM c WHERE c.storeId = @storeId AND c.loyaltyItemId = @loyaltyItemId',
        parameters: [
          { name: '@storeId', value: storeId },
          { name: '@loyaltyItemId', value: loyaltyItemId }
        ]
      })
      .fetchAll();

    // Delete all assignments
    for (const assignment of assignments) {
      await containerProductLoyaltyItems.item(assignment.id, storeId).delete();
    }

    // Delete the loyalty item
    await containerLoyaltyItems.item(loyaltyItemId, userId).delete();

    // Revalidate the store page
    revalidatePath(`/${storeId}`);
    revalidatePath(`/${storeId}/promotion`);

    return { success: true };
  } catch (error) {
    logger.error('Error deleting loyalty item:', error instanceof Error ? error.message : String(error));
    return { success: false, error: 'Failed to delete loyalty item' };
  }
}

// Get all product loyalty item assignments for a store
export async function getProductLoyaltyItemAssignments(storeId: string): Promise<{ success: boolean; data?: ProductLoyaltyItemAssignment[]; error?: string }> {
  try {
    // Verify ownership
    if (!await verifyStoreOwnership(storeId)) {
      return { success: false, error: 'Unauthorized' };
    }

    const { resources } = await containerProductLoyaltyItems.items
      .query({
        query: 'SELECT * FROM c WHERE c.storeId = @storeId',
        parameters: [{ name: '@storeId', value: storeId }]
      })
      .fetchAll();

    return { success: true, data: resources };
  } catch (error) {
    logger.error('Error fetching product loyalty item assignments:', error instanceof Error ? error.message : String(error));
    return { success: false, error: 'Failed to fetch product loyalty item assignments' };
  }
}

// Update product loyalty item assignments in bulk
export async function updateProductLoyaltyItemAssignments(data: unknown): Promise<{ success: boolean; error?: string }> {
  try {
    // Validate input
    const parsed = BulkProductLoyaltyItemAssignmentSchema.safeParse(data);
    if (!parsed.success) {
      return { success: false, error: 'Invalid input data' };
    }

    const { storeId, assignments } = parsed.data;

    // Verify ownership
    if (!await verifyStoreOwnership(storeId)) {
      return { success: false, error: 'Unauthorized' };
    }

    // Get existing assignments
    const { resources: existingAssignments } = await containerProductLoyaltyItems.items
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
      
      if (assignment.loyaltyItemId === null) {
        // Remove assignment if it exists
        if (existing) {
          await containerProductLoyaltyItems.item(existing.id, storeId).delete();
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
          await containerProductLoyaltyItems.item(existing.id, storeId).replace(assignmentData);
        } else {
          await containerProductLoyaltyItems.items.create({
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
    logger.error('Error updating product loyalty item assignments:', error instanceof Error ? error.message : String(error));
    return { success: false, error: 'Failed to update product loyalty item assignments' };
  }
}