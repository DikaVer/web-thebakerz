'use server';
import { containerInventoryHolds } from '@/db';
import { v4 as uuidv4 } from 'uuid';
import { logger } from '@/lib/logger';
import { now } from '@internationalized/date';
import { toZoned } from '@internationalized/date';
import { stripe } from '@/stripe';

export interface InventoryRescueHold {
  id: string;
  productId: string;
  storeId: string;
  quantity: number;
  stripePaymentIntentId?: string;
  createdAt: Date;
  expiresAt: Date;
  userId: string;
}

/**
 * Creates a hold record for rescue deal inventory
 */
export async function createInventoryHold(
  productId: string,
  storeId: string,
  quantity: number,
  userId: string
): Promise<{ success: boolean; holdId?: string; error?: string }> {
  try {
    const holdId = uuidv4();
    const currentTime = now("Europe/Amsterdam");
    const createdAt = currentTime.toDate();
    const expiresAt = new Date(createdAt.getTime() + 3 * 60 * 1000); // 3 minutes from now

    const hold: InventoryRescueHold = {
      id: holdId,
      productId,
      storeId,
      quantity,
      createdAt,
      expiresAt,
      userId
    };

    await containerInventoryHolds.items.create(hold);
    
    logger.info('inventory-holds', 'Hold created', { holdId, productId, storeId, quantity });
    
    return { success: true, holdId };
  } catch (error) {
    logger.error('inventory-holds', 'Error creating hold:', { error, productId, storeId });
    return { success: false, error: 'Failed to create inventory hold' };
  }
}

/**
 * Attaches a Stripe payment intent ID to an existing hold
 */
export async function attachPaymentIntentToHold(
  holdId: string,
  storeId: string,
  stripePaymentIntentId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const { resource: hold } = await containerInventoryHolds.item(holdId, storeId).read();
    
    if (!hold) {
      return { success: false, error: 'Hold not found' };
    }

    // Check if hold is still valid
    const currentTime = now("Europe/Amsterdam").toDate();
    if (currentTime > new Date(hold.expiresAt)) {
      return { success: false, error: 'Hold has expired' };
    }

    const updatedHold = {
      ...hold,
      stripePaymentIntentId
    };

    await containerInventoryHolds.item(holdId, storeId).replace(updatedHold);
    
    logger.info('inventory-holds', 'Payment intent attached', { holdId, stripePaymentIntentId });
    
    return { success: true };
  } catch (error) {
    logger.error('inventory-holds', 'Error attaching payment intent:', { error, holdId });
    return { success: false, error: 'Failed to attach payment intent' };
  }
}

/**
 * Gets all active holds for a store
 */
export async function getActiveHolds(storeId: string): Promise<InventoryRescueHold[]> {
  try {
    const currentTime = now("Europe/Amsterdam").toDate();
    
    const query = {
      query: `
        SELECT * FROM c 
        WHERE c.storeId = @storeId 
        AND c.expiresAt > @now
      `,
      parameters: [
        { name: '@storeId', value: storeId },
        { name: '@now', value: currentTime.toISOString() }
      ]
    };

    const { resources } = await containerInventoryHolds.items.query(query).fetchAll();
    return resources || [];
  } catch (error) {
    logger.error('inventory-holds', 'Error fetching active holds:', { error, storeId });
    return [];
  }
}

/**
 * Gets all active holds for a store
 */
export async function getActiveHoldsByUserIdAndStoreId(userId: string, storeId: string): Promise<Record<string, string> > {
    try {
      const currentTime = now("Europe/Amsterdam").toDate();
      
      const query = {
        query: `
          SELECT c.id, c.quantity FROM c 
          WHERE c.userId = @userId 
          AND c.storeId = @storeId 
          AND c.expiresAt > @now
        `,
        parameters: [
          { name: '@userId', value: userId },
          { name: '@storeId', value: storeId },
          { name: '@now', value: currentTime.toISOString() }
        ]
      };
  
      const { resources } = await containerInventoryHolds.items.query(query).fetchAll();
      return resources?.reduce((acc, r) => {
        acc[r.id] = r.quantity;
        return acc;
      }, {} as Record<string, string>) || {};
    } catch (error) {
      logger.error('inventory-holds', 'Error fetching active holds:', { error, userId, storeId });
      return {};
    }
  }

/**
 * Gets total quantity on hold for specific products
 */
export async function getQuantitiesOnHold(
  storeId: string,
  productIds: string[]
): Promise<Record<string, number>> {
  try {
    const currentTime = now("Europe/Amsterdam").toDate();
    
    const query = {
      query: `
        SELECT c.productId, SUM(c.quantity) as totalHeld
        FROM c 
        WHERE c.storeId = @storeId 
        AND c.expiresAt > @now
        AND ARRAY_CONTAINS(@productIds, c.productId)
        GROUP BY c.productId
      `,
      parameters: [
        { name: '@storeId', value: storeId },
        { name: '@now', value: currentTime.toISOString() },
        { name: '@productIds', value: productIds }
      ]
    };

    const { resources } = await containerInventoryHolds.items.query(query).fetchAll();
    
    const quantities: Record<string, number> = {};
    productIds.forEach(id => quantities[id] = 0); // Initialize all to 0
    
    resources.forEach(item => {
      quantities[item.productId] = item.totalHeld || 0;
    });
    
    return quantities;
  } catch (error) {
    logger.error('inventory-holds', 'Error fetching quantities on hold:', { error, storeId });
    return {};
  }
}

/**
 * Purges expired holds and cancels associated payment intents - used by cron job
 */
export async function purgeExpiredHolds(): Promise<{ success: boolean; deletedCount: number; cancelledPayments: number; error?: string }> {
  try {
    const currentTime = now("Europe/Amsterdam").toDate();
    
    const query = {
      query: `
        SELECT c.id, c.storeId, c.stripePaymentIntentId FROM c 
        WHERE c.expiresAt < @now
      `,
      parameters: [
        { name: '@now', value: currentTime.toISOString() }
      ]
    };

    const { resources } = await containerInventoryHolds.items.query(query).fetchAll();
    
    let deletedCount = 0;
    let cancelledPayments = 0;
    
    for (const hold of resources) {
      try {
        // Cancel associated payment intent if it exists
        if (hold.stripePaymentIntentId) {
          try {
            await stripe.paymentIntents.cancel(hold.stripePaymentIntentId);
            cancelledPayments++;
            logger.info('inventory-holds', 'Payment intent cancelled during purge', {
              holdId: hold.id,
              paymentIntentId: hold.stripePaymentIntentId
            });
          } catch (stripeError: any) {
            // Log but don't fail the entire operation if payment intent cancellation fails
            logger.warn('inventory-holds', 'Failed to cancel payment intent during purge', {
              holdId: hold.id,
              paymentIntentId: hold.stripePaymentIntentId,
              error: stripeError.message
            });
          }
        }

        // Delete the hold
        await containerInventoryHolds.item(hold.id, hold.storeId).delete();
        deletedCount++;
      } catch (deleteError) {
        logger.error('inventory-holds', 'Error deleting expired hold:', { 
          error: deleteError, 
          holdId: hold.id 
        });
      }
    }
    
    if (deletedCount > 0 || cancelledPayments > 0) {
      logger.info('inventory-holds', 'Expired holds purged', { 
        deletedCount, 
        cancelledPayments 
      });
    }
    
    return { success: true, deletedCount, cancelledPayments };
  } catch (error) {
    logger.error('inventory-holds', 'Error purging expired holds:', { error });
    return { success: false, deletedCount: 0, cancelledPayments: 0, error: 'Failed to purge expired holds' };
  }
}

/**
 * Removes a specific hold and cancels associated payment intent (e.g., when payment is cancelled)
 */
export async function removeHold(
  holdId: string,
  storeId: string
): Promise<{ success: boolean; paymentCancelled?: boolean; error?: string }> {
  try {
    // First get the hold to check for payment intent
    const { resource: hold } = await containerInventoryHolds.item(holdId, storeId).read();
    
    let paymentCancelled = false;
    
    // // Cancel payment intent if it exists
    // if (hold?.stripePaymentIntentId) {
    //   try {
    //     await stripe.paymentIntents.cancel(hold.stripePaymentIntentId);
    //     paymentCancelled = true;
    //     logger.info('inventory-holds', 'Payment intent cancelled with hold removal', {
    //       holdId,
    //       paymentIntentId: hold.stripePaymentIntentId
    //     });
    //   } catch (stripeError: any) {
    //     logger.warn('inventory-holds', 'Failed to cancel payment intent during hold removal', {
    //       holdId,
    //       paymentIntentId: hold.stripePaymentIntentId,
    //       error: stripeError.message
    //     });
    //   }
    // }
    
    // Remove the hold
    await containerInventoryHolds.item(holdId, storeId).delete();
    
    logger.info('inventory-holds', 'Hold removed', { holdId, storeId, paymentCancelled });
    
    return { success: true, paymentCancelled };
  } catch (error) {
    logger.error('inventory-holds', 'Error removing hold:', { error, holdId });
    return { success: false, error: 'Failed to remove hold' };
  }
}
