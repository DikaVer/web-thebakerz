'use server';
import { containerRescueDeals } from '@/db';
import { RescueDealSchema, RescueDealType } from '@/lib/utils/schemas/rescue-schema';
import { v4 as uuidv4 } from 'uuid';
import { logger } from '@/lib/logger';
import { getCurrentSession } from './session';

export interface RescueDeal extends RescueDealType {
  id: string;
  storeId: string;
}

export interface RescueDealProduct {
  promotionPercent: number; 
  quantity: number; 
  isSelected: boolean;
}

const RESCUE_DEALS_FIELDS = [
  "c.id",
  "c.storeId",
  "c.isActive",
  "c.products"

]

export async function saveRescueDeal(storeId: string, raw: unknown, rescueDealId?: string) {
  try {
    const parsed = RescueDealSchema.safeParse(raw);
    if (!parsed.success) {
      return { 
        success: false, 
        issues: parsed.error.issues,
        error: 'Validation failed'
      };
    }

    const { stores } = await getCurrentSession();
    const store = stores?.find(s => s.id === storeId);
    if (!store) {
      return { 
        success: false, 
        error: 'Store not found' 
      };
    }

    const data = parsed.data;
    
    const rescueDeal: RescueDeal = {
      id: rescueDealId || uuidv4(),
      storeId,
      ...data
    };

    await containerRescueDeals.items.upsert(rescueDeal);
    
    return { success: true, data: rescueDeal };
  } catch (error) {
    logger.error('rescue-deal', 'Error saving rescue deal:', { error, storeId });
    return { 
      success: false, 
      error: 'Failed to save rescue deal' 
    };
  }
}

export async function getRescueDeal(storeId: string): Promise<RescueDeal | null> {
  try {
    const query = {
      query: `SELECT ${RESCUE_DEALS_FIELDS.join(',')} FROM c WHERE c.storeId = @storeId`,
      parameters: [
        { name: '@storeId', value: storeId }
      ]
    };

    const { resources } = await containerRescueDeals.items.query(query).fetchAll();
    
    if (resources.length === 0) {
      return null;
    }

    if (resources.length > 1) {
      logger.warn('rescue-deal', `Found multiple rescue deals for store ${storeId}. This may indicate old data that needs cleanup. Returning the first one.`);
    }

    return resources[0] as RescueDeal;
  } catch (error) {
    logger.error('rescue-deal', 'Error fetching rescue deal:', { error, storeId });
    return null;
  }
}
