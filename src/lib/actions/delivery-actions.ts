'use server';

import { containerDeliveryRegions, containerDeliveryLocations } from "@/db";
import { revalidateTag } from "next/cache";
import { getCurrentSession, getSessionCookie, getSessionCookieOrCreate } from "@/lib/actions/session";
import { DeliveryRegionsSchema } from "@/lib/schemas/delivery.schema";
import { WorkHours } from "@/lib/actions/calendar-actions";
import { getCurrentStoreByUserIdAndStoreId } from "@/lib/actions/store";
import { getTranslations } from "next-intl/server";
import { globalGETRateLimit, globalPOSTRateLimit } from "@/lib/actions/requests";
import { v4 as uuidv4 } from "uuid";

export interface DeliveryRange {
  range: number;
  deliveryPriceInCents: number;
  minOrderPriceInCents: number;
  deliveryWindow: number; // Delivery window duration in minutes
}

// Add DeliveryAddressRaw interface
export interface DeliveryAddressRaw {
  street: string;
  houseNumber: string;
  city: string;
  zipCode: string;
  country: string;
  additionalInfo?: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  formattedAddress: string;

}

// Add DeliveryAddress interface
export interface DeliveryAddress extends DeliveryAddressRaw {
  id: string;
  userId: string;
  createdAt: string;
  updatedAt?: string;

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
  deliveryWindow?: number; // Delivery window duration in minutes
  isCountry: boolean; // New field to identify if it's a country-wide delivery
}

export async function getMerchantDeliveryRegions(storeId: string) {
  try {
    const { resources } = await containerDeliveryRegions.items
      .query(`SELECT c.name, c.minOrderTime, c.coordinates, c.deliverySchedule, c.isStoreDelivery, c.isPostDelivery, c.ranges, c.deliveryPriceInCents, c.minOrderPriceInCents, c.isCountry, c.deliveryWindow FROM c WHERE c.storeId = "${storeId}"`)
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

    console.log("Updating merchant delivery regions:", regions);
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
      .query(`SELECT c.id, c.name, c.minOrderTime, c.coordinates, c.deliverySchedule, c.isStoreDelivery, c.isPostDelivery, c.ranges, c.deliveryPriceInCents, c.minOrderPriceInCents, c.isCountry, c.deliveryWindow FROM c WHERE c.storeId = "${storeId}"`)
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
        deliveryWindow: region.deliveryWindow,
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

/**
 * Replace guest address with the logged-in user's address.
 * This function queries the address for the guest (guestId) and creates a new address
 * with userId set to the logged-in user's ID, then deletes the guest address.
 *
 * @param storeId - The store's ID (not used in the query but kept for API consistency).
 * @returns An object indicating success or error.
 */
export const replaceGuestAddress = async (): Promise<{ success?: string; error?: string }> => {
  const t = await getTranslations("app/lib/actions/delivery") as (key: string, params?: Record<string, string | number>) => string;
  
  try {
    if (!(await globalGETRateLimit())) {
      return { error: t("tooManyRequests") };
    }

    const session = await getCurrentSession();

    if (!session || !session.user) {
      return { error: t("sessionNotRecognized") };
    }

    const userId = session.user.id;
    const guestId = await getSessionCookie();
    if (!guestId) {
      return { error: t("guestIdNotFound") };
    }

    const guestPartitionKey = [guestId];
    const userPartitionKey = [userId];

    // Query for guest addresses
    const guestQuerySpec = {
      query: "SELECT * FROM c WHERE c.userId = @guestId",
      parameters: [
        { name: "@guestId", value: guestId }
      ],
    };

    const { resources: guestAddresses } = await containerDeliveryLocations.items
      .query(guestQuerySpec, { partitionKey: guestPartitionKey })
      .fetchAll();

    // Query for user addresses
    const userQuerySpec = {
      query: "SELECT * FROM c WHERE c.userId = @userId",
      parameters: [
        { name: "@userId", value: userId }
      ],
    };

    const { resources: userAddresses } = await containerDeliveryLocations.items
      .query(userQuerySpec, { partitionKey: userPartitionKey })
      .fetchAll();

    const operations = [];

    // Add user addresses deletion to operations
    if (userAddresses && userAddresses.length > 0) {
      operations.push(
        ...userAddresses.map((address: DeliveryAddress) =>
          containerDeliveryLocations.item(address.id, userPartitionKey).delete()
        )
      );
    }

    // Add guest addresses replacement to operations
    if (guestAddresses && guestAddresses.length > 0) {
      operations.push(
        ...guestAddresses.map(async (address: DeliveryAddress) => {
          const newAddress: DeliveryAddress = {
            ...address,
            id: uuidv4(),
            userId: userId,
            createdAt: new Date().toISOString()
          };
          return Promise.all([
            containerDeliveryLocations.items.create(newAddress),
            containerDeliveryLocations.item(address.id, guestPartitionKey).delete()
          ]);
        })
      );
    }

    // Execute all operations in parallel
    if (operations.length > 0) {
      await Promise.all(operations);
    }

    revalidateTag('delivery-address');

    return {
      success: t("guestAddressReplacedSuccess")
    };
  } catch (error: any) {
    console.error("Error replacing guest address:", error);
    return { error: t("failedReplaceGuestAddress") };
  }
}
