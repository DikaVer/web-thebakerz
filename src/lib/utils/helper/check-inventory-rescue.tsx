'use server';
import { containerOrders } from '@/db';
import { getRescueDeal, RescueDeal } from '@/lib/actions/rescue-deal';
import { getQuantitiesOnHold, createInventoryHold } from './inventory-holds';
import { logger } from '@/lib/logger';
import { now } from '@internationalized/date';

export interface InventoryCheckResult {
  isAvailable: boolean;
  updatedQuantities: Record<string, number>;
  holdIds?: Record<string, string>; // productId -> holdId mapping
  error?: string;
}

/**
 * Checks rescue deal inventory availability and creates holds if items are available
 * 
 * @param productIds - Array of product IDs to check/reserve
 * @param storeId - Store ID to check against
 * @returns InventoryCheckResult with availability status and updated quantities
 */
export async function checkAndReserveInventory(
  productIds: string[],
  storeId: string,
  quantities: Record<string, number> = {},
  userId: string,
  holds: boolean = true
): Promise<InventoryCheckResult> {
  try {
    // 1. Retrieve today's rescue orders
    const todaysOrders = await getTodaysRescueOrders(storeId);
    
    // 2. Retrieve active rescue deals for the store
    const rescueDeal = await getRescueDeal(storeId);
    if (!rescueDeal || !rescueDeal.isActive) {
      return {
        isAvailable: false,
        updatedQuantities: {},
        error: 'No active rescue deals found for this store'
      };
    }

    // 3. Get quantities currently on hold
    const quantitiesOnHold = await getQuantitiesOnHold(storeId, productIds);

    // 4. Calculate available quantities for each product
    const updatedQuantities: Record<string, number> = {};
    const unavailableProducts: string[] = [];

    for (const productId of productIds) {
      const rescueProduct = rescueDeal.products?.find(p => p.id === productId);
      if (!rescueProduct || !rescueProduct.isSelected) {
        unavailableProducts.push(productId);
        updatedQuantities[productId] = 0;
        continue;
      }

      // Calculate total quantity sold today for this product
      const soldToday = todaysOrders.reduce((total, order: any) => {
        const orderProduct = order.productsData?.find((p: any) => p.id === productId);
        return total + (orderProduct?.qty || 0);
      }, 0);

      // Calculate available quantity
      const totalAvailable = rescueProduct.quantity;
      const onHold = quantitiesOnHold[productId] || 0;
      const requestedQuantity = quantities[productId] || -1;
      const availableNow = totalAvailable - soldToday - onHold;

      updatedQuantities[productId] = Math.max(0, availableNow);

      // Check if requested quantity is available
      if (availableNow < requestedQuantity) {
        unavailableProducts.push(productId);
      }
    }

    // If any products are unavailable, return false
    if (unavailableProducts.length > 0) {
      return {
        isAvailable: false,
        updatedQuantities,
        error: `Insufficient inventory for products: ${unavailableProducts.join(', ')}`
      };
    }

    if(holds){
        // 5. Create inventory holds for all requested products
        const holdIds: Record<string, string> = {};
        const holdPromises = productIds.map(async (productId) => {
        const requestedQuantity = quantities[productId] || 1;
        const holdResult = await createInventoryHold(productId, storeId, requestedQuantity, userId);
        
        if (holdResult.success && holdResult.holdId) {
            holdIds[productId] = holdResult.holdId;
            // Update available quantities to reflect the new hold
            updatedQuantities[productId] = Math.max(0, updatedQuantities[productId] - requestedQuantity);
        } else {
            throw new Error(`Failed to create hold for product ${productId}: ${holdResult.error}`);
        }
        });

        await Promise.all(holdPromises);



        logger.info('check-inventory-rescue', 'Inventory check and reserve completed', {
        storeId,
        productIds,
        quantities,
        holdIds
        });


        return {
        isAvailable: true,
        updatedQuantities,
        holdIds
        };
    }

    return {
      isAvailable: true,
      updatedQuantities,
      holdIds: {}
    };

  } catch (error) {
    logger.error('check-inventory-rescue', 'Error checking/reserving inventory:', { 
      error, 
      storeId, 
      productIds 
    });
    
    return {
      isAvailable: false,
      updatedQuantities: {},
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    };
  }
}

/**
 * Gets today's rescue deal orders for a store
 */
async function getTodaysRescueOrders(storeId: string) {
  try {
    const today = now("Europe/Amsterdam");
    const todayString = `${today.year}-${today.month}-${today.day}`;

    const query = {
      query: `
        SELECT c.productsData 
        FROM c 
        WHERE c.store_id = @storeId 
        AND c.isRescueDeal = true
        AND c.scheduled_time.date = @todayString
        AND (c.order_status != 'cancelled' AND c.order_status != 'refunded')
      `,
      parameters: [
        { name: '@storeId', value: storeId },
        { name: '@todayString', value: todayString }
      ]
    };

    const { resources } = await containerOrders.items.query(query).fetchAll();
    return resources || [];
  } catch (error) {
    logger.error('check-inventory-rescue', 'Error fetching today\'s rescue orders:', { error, storeId });
    return [];
  }
}

/**
 * Simple inventory check without creating holds (for display purposes)
 */
export async function checkInventoryAvailability(
  productIds: string[],
  storeId: string
): Promise<Record<string, number>> {
  try {
    // Get today's rescue orders
    const todaysOrders = await getTodaysRescueOrders(storeId);
    
    // Get active rescue deals
    const rescueDeal = await getRescueDeal(storeId);
    if (!rescueDeal || !rescueDeal.isActive) {
      return productIds.reduce((acc, id) => ({ ...acc, [id]: 0 }), {});
    }

    // Get quantities on hold
    const quantitiesOnHold = await getQuantitiesOnHold(storeId, productIds);

    // Calculate available quantities
    const availableQuantities: Record<string, number> = {};

    for (const productId of productIds) {
      const rescueProduct = rescueDeal.products?.find(p => p.id === productId);
      if (!rescueProduct || !rescueProduct.isSelected) {
        availableQuantities[productId] = 0;
        continue;
      }

      // Calculate sold today
      const soldToday = todaysOrders.reduce((total, order: any) => {
        const orderProduct = order.productsData?.find((p: any) => p.id === productId);
        return total + (orderProduct?.qty || 0);
      }, 0);

      // Calculate available
      const totalAvailable = rescueProduct.quantity;
      const onHold = quantitiesOnHold[productId] || 0;
      const availableNow = totalAvailable - soldToday - onHold;

      availableQuantities[productId] = Math.max(0, availableNow);
    }

    return availableQuantities;
  } catch (error) {
    logger.error('check-inventory-rescue', 'Error checking inventory availability:', { error, storeId });
    return productIds.reduce((acc, id) => ({ ...acc, [id]: 0 }), {});
  }
}
