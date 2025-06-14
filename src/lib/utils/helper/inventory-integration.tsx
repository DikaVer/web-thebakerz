'use server';
import { checkInventoryAvailability } from './check-inventory-rescue';
import { removeHold } from './inventory-holds';
import { logger } from '@/lib/logger';


/**
 * Release inventory holds when payment is cancelled
 */
export async function cancelRescueDealCheckout(
  storeId: string,
  holdIds: Record<string, string>
) {
  try {
    const results = await Promise.allSettled(
      Object.values(holdIds).map(holdId => removeHold(holdId, storeId))
    );

    const failed = results.filter(r => r.status === 'rejected').length;
    
    if (failed > 0) {
      logger.warn('inventory-integration', `Failed to release ${failed} holds`, { storeId, holdIds });
    }

    return {
      success: failed === 0,
      releasedCount: results.length - failed,
      failedCount: failed
    };
  } catch (error) {
    logger.error('inventory-integration', 'Error cancelling checkout:', { error, storeId });
    return {
      success: false,
      releasedCount: 0,
      failedCount: Object.keys(holdIds).length
    };
  }
}

/**
 * Get real-time inventory for display purposes
 */
export async function getRescueDealInventory(
  storeId: string,
  productIds: string[]
): Promise<Record<string, { available: number; onHold: number; total: number }>> {
  try {
    const availableQuantities = await checkInventoryAvailability(productIds, storeId);
    
    // For display purposes, you might want to show more detailed info
    const detailedInventory: Record<string, { available: number; onHold: number; total: number }> = {};
    
    for (const productId of productIds) {
      // This would require additional queries to get hold info and total quantities
      detailedInventory[productId] = {
        available: availableQuantities[productId] || 0,
        onHold: 0, // Would need to query this separately
        total: 0   // Would need to get from rescue deal data
      };
    }

    return detailedInventory;
  } catch (error) {
    logger.error('inventory-integration', 'Error getting inventory:', { error, storeId });
    return {};
  }
} 