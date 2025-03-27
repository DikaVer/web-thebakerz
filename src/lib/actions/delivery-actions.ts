'use server';

import { containerDeliveryRegions } from "@/db";
import {revalidatePath, revalidateTag} from "next/cache";
import {getCurrentSession} from "@/lib/actions/session";

export interface DeliveryRegion {
  id: string;
  name: string;
  code: string;
  description?: string;
}

// Interface for time schedule
export interface TimeRange {
  isEnabled: boolean;
  start: { hour: number; minute: number };
  end: { hour: number; minute: number };
}

// Interface for weekly schedule
export interface DeliverySchedule {
  monday?: TimeRange;
  tuesday?: TimeRange;
  wednesday?: TimeRange;
  thursday?: TimeRange;
  friday?: TimeRange;
  saturday?: TimeRange;
  sunday?: TimeRange;
}

export interface MerchantDeliveryRegion {
  id: string;
  storeId: string;
  name: string;
  radiusKm: number;
  priceInCents: number;
  minOrderPriceInCents: number;
  coordinates: { lat: number, lng: number };
  deliverySchedule: DeliverySchedule;
}


export async function getMerchantDeliveryRegions(storeId: string) {
  try {
    const { resources } = await containerDeliveryRegions.items
      .query(`SELECT * FROM c WHERE c.storeId = "${storeId}" AND c.type = 'merchant_region'`)
      .fetchAll();
    return resources as MerchantDeliveryRegion[];
  } catch (error) {
    console.error("Error fetching merchant delivery regions:", error);
    throw new Error("Failed to fetch merchant delivery regions");
  }
}

export async function updateMerchantDeliveryRegions(
  regions: { 
    name: string; 
    radiusKm: number; 
    priceInCents: number; 
    minOrderPriceInCents: number;
    coordinates: { lat: number, lng: number }; 
    deliverySchedule: DeliverySchedule;
  }[]
) {
  try {
    const { store } = await getCurrentSession();
    if (!store) {
      throw new Error("Not authenticated");
    }

    const storeId = store.id;

    // Delete existing regions
    const { resources } = await containerDeliveryRegions.items
      .query(`SELECT * FROM c WHERE c.storeId = "${storeId}" AND c.type = 'merchant_region'`)
      .fetchAll();
    
    for (const resource of resources) {
      await containerDeliveryRegions.item(resource.id, storeId).delete();
    }

    // Add new regions
    for (const region of regions) {
      await containerDeliveryRegions.items.create({
        id: `${storeId}-${region.name.toLowerCase().replace(/\s+/g, '-')}`,
        storeId: storeId,
        name: region.name,
        coordinates: region.coordinates,
        radiusKm: region.radiusKm,
        priceInCents: region.priceInCents,
        minOrderPriceInCents: region.minOrderPriceInCents || 1000,
        deliverySchedule: region.deliverySchedule || {},
        type: 'merchant_region',
      });
    }

    revalidateTag("store");
    revalidateTag("session");
    return { success: true };
  } catch (error) {
    console.error("Error updating merchant delivery regions:", error);
    throw new Error("Failed to update delivery regions");
  }
}
