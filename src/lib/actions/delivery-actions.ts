'use server';

import { containerDeliveryRegions } from "@/db";
import { revalidateTag } from "next/cache";
import { getCurrentSession } from "@/lib/actions/session";
import { DeliveryRegionsSchema } from "@/lib/schemas/delivery.schema";
import { WorkHours } from "@/lib/actions/calendar-actions";
import {getCurrentStoreByUserIdAndStoreId} from "@/lib/actions/store";

export interface DeliveryRange {
  range: number;
  deliveryPriceInCents: number;
  minOrderPriceInCents: number;
}

export interface MerchantDeliveryRegion {
  id: string;
  storeId: string;
  name: string;
  radiusKm: number; // Legacy - keeping for backward compatibility
  priceInCents: number; // Legacy - keeping for backward compatibility
  minOrderPriceInCents: number; // Legacy - keeping for backward compatibility
  minOrderTime: number;
  coordinates: { lat: number, lng: number };
  deliverySchedule: WorkHours;
  isStoreDelivery: boolean;
  ranges?: DeliveryRange[]; // New field for multiple ranges
}

export async function getMerchantDeliveryRegions(storeId: string) {
  try {
    const { resources } = await containerDeliveryRegions.items
      .query(`SELECT * FROM c WHERE c.storeId = "${storeId}"`)
      .fetchAll();
    return resources as MerchantDeliveryRegion[];
  } catch (error) {
    console.error("Error fetching merchant delivery regions:", error);
    throw new Error("Failed to fetch merchant delivery regions");
  }
}

export async function updateMerchantDeliveryRegions(
    storeId: string,
    regions: {
      name: string;
      radiusKm: number;
      priceInCents: number;
      minOrderPriceInCents: number;
      coordinates: { lat: number, lng: number };
      deliverySchedule: WorkHours | undefined;
      isStoreDelivery: boolean;
      minOrderTime: number;
      ranges?: DeliveryRange[]; // Add support for multiple ranges
    }[]
) {
  try {
    console.log("regions", regions);
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

    // Delete existing regions
    const { resources } = await containerDeliveryRegions.items
      .query(`SELECT * FROM c WHERE c.storeId = "${storeId}"`)
      .fetchAll();
    
    for (const resource of resources) {
      await containerDeliveryRegions.item(resource.id, storeId).delete();
    }


    // Add new regions
    for (const region of validationResult.data) {
      await containerDeliveryRegions.items.create({
        id: `${storeId}-${region.name.toLowerCase().replace(/\s+/g, '-')}`,
        storeId: storeId,
        name: region.name,
        coordinates: region.coordinates,
        radiusKm: region.radiusKm,  
        priceInCents: region.priceInCents,
        minOrderPriceInCents: region.minOrderPriceInCents,
        minOrderTime: region.minOrderTime,
        deliverySchedule: region.deliverySchedule,
        isStoreDelivery: user.role === "admin" ? region.isStoreDelivery : true,
        ranges: region.ranges || [{ 
          range: region.radiusKm, 
          deliveryPriceInCents: region.priceInCents,
          minOrderPriceInCents: region.minOrderPriceInCents
        }]
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
