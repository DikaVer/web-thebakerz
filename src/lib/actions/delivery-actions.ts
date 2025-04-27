'use server';

import { containerDeliveryRegions } from "@/db";
import { revalidateTag } from "next/cache";
import { getCurrentSession } from "@/lib/actions/session";
import { DeliveryRegionsSchema } from "@/lib/schemas/delivery.schema";
import { WorkHours } from "@/lib/actions/calendar-actions";
import { getCurrentStoreByUserIdAndStoreId } from "@/lib/actions/store";

export interface DeliveryRange {
  range: number;
  deliveryPriceInCents: number;
  minOrderPriceInCents: number;
}

export interface MerchantDeliveryRegion {
  id: string;
  storeId: string;
  name: string;
  minOrderTime: number;
  coordinates?: { lat: number, lng: number }; // City coordinates
  deliverySchedule: WorkHours;
  isStoreDelivery: boolean; // Whether delivery is handled by the store or platform
  isPostDelivery: boolean; // Whether delivery is handled by postal service
  ranges?: DeliveryRange[]; // For multiple city ranges
  deliveryPriceInCents?: number; // Country delivery price
  minOrderPriceInCents?: number; // Country minimum order price
  isCountry: boolean; // New field to identify if it's a country-wide delivery
}

export async function getMerchantDeliveryRegions(storeId: string) {
  try {
    const { resources } = await containerDeliveryRegions.items
      .query(`SELECT c.name, c.minOrderTime, c.coordinates, c.deliverySchedule, c.isStoreDelivery, c.isPostDelivery, c.ranges, c.deliveryPriceInCents, c.minOrderPriceInCents, c.isCountry FROM c WHERE c.storeId = "${storeId}"`)
      .fetchAll();
    
    return resources as MerchantDeliveryRegion[];
  } catch (error) {
    console.error("Error fetching merchant delivery regions:", error);
    throw new Error("Failed to fetch merchant delivery regions");
  }
}

export async function updateMerchantDeliveryRegions(
    storeId: string,
    regions: MerchantDeliveryRegion[]
) {
  try {
    // Validate the input data
    const validationResult = DeliveryRegionsSchema.safeParse(regions);
    
    if (!validationResult.success) {
      console.error("Validation error:", validationResult.error);
      throw new Error("Invalid delivery region data");
    }

    const { user } = await getCurrentSession();
    if (!user) {
      throw new Error("Not authenticated");
    }

  
    if(user.role !== "admin") {
      const { store: storeData } = await getCurrentStoreByUserIdAndStoreId(user.id, storeId);
      if (!storeData) {
        throw new Error("Store not found");
      }
    }


    // Get existing regions
    const { resources: existingRegions } = await containerDeliveryRegions.items
      .query(`SELECT c.id, c.name, c.minOrderTime, c.coordinates, c.deliverySchedule, c.isStoreDelivery, c.isPostDelivery, c.ranges, c.deliveryPriceInCents, c.minOrderPriceInCents, c.isCountry FROM c WHERE c.storeId = "${storeId}"`)
      .fetchAll();
    
    // Create a map of existing regions for quick lookup
    const existingRegionsMap = new Map();
    for (const region of existingRegions) {
      existingRegionsMap.set(region.name, region);
      await containerDeliveryRegions.item(region.id, storeId).delete();
    }

    // Add new regions
    for (const region of validationResult.data) {
      // For non-admin users, if the region existed before with isStoreDelivery=false, preserve that value
      let isStoreDeliveryValue = region.isStoreDelivery;
      
      if (user.role !== "admin") {
        const existingRegion = existingRegionsMap.get(region.name);

        if (existingRegion && existingRegion.isStoreDelivery === false) {
          if(region.isStoreDelivery !== existingRegion.isStoreDelivery) {
              continue;
          }
          isStoreDeliveryValue = false;
        } else {
          isStoreDeliveryValue = true;
        }
      }  

      const regionData: MerchantDeliveryRegion = {
        id: `${storeId}-${region.name}`,
        storeId: storeId,
        name: region.name,
        coordinates: region.coordinates,
        deliverySchedule: region.deliverySchedule,
        isStoreDelivery: isStoreDeliveryValue,
        isPostDelivery: region.isPostDelivery,
        ranges: region.ranges,
        isCountry: region.isCountry,
        minOrderTime: region.minOrderTime,
        deliveryPriceInCents: region.deliveryPriceInCents,
        minOrderPriceInCents: region.minOrderPriceInCents,
      }

      await containerDeliveryRegions.items.create(regionData);
    }

    revalidateTag("store");
    revalidateTag("session");
    return { success: true };
  } catch (error) {
    console.error("Error updating merchant delivery regions:", error);
    throw new Error("Failed to update delivery regions");
  }
}
