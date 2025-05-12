"use server";

import { containerDeliveryLocations  } from "@/db";
import { getSessionCookieOrCreate, getSessionCookie, getCurrentSession } from "@/lib/actions/session";
import { MAX_CHARS_ADDRESS } from "@/lib/schemas/address.schema";
import { revalidateTag } from "next/cache";
import { v4 as uuidv4 } from "uuid";


// Extend the DeliveryAddressRaw interface with more Google Maps data
export interface ExtendedDeliveryAddressRaw extends DeliveryAddressRaw {
  placeId?: string;
  administrativeAreas?: string[];
  neighborhood?: string;
  premise?: string;
  subpremise?: string;
  addressComponents?: google.maps.GeocoderAddressComponent[];
}

export interface DeliveryAddressRaw {
  street?: string;
  houseNumber?: string;
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

export interface DeliveryAddress extends DeliveryAddressRaw {
  id: string;
  userId: string;
  createdAt: string;
  updatedAt?: string;
}

// Helper function to truncate strings to max length
function truncateField(value: string | undefined, maxLength: number): string {
  if (!value) return '';
  return value.slice(0, maxLength);
}

/**
 * Updates the delivery address for a user in a specific store
 */
export async function updateDeliveryAddress(
  address: ExtendedDeliveryAddressRaw
): Promise<{ success?: string; error?: string }> {
  try {
    // Validate and truncate input fields
    const sanitizedAddress = {
      ...address,
      additionalInfo: truncateField(address.additionalInfo, MAX_CHARS_ADDRESS.additionalInfo)
    };

    // Get user ID from session or use guest ID
    const session = await getCurrentSession();
    let userId;
    if (!session || !session.user) {
      userId = await getSessionCookieOrCreate();
    } else {
      userId = session.user.id;
    }
    
    if (!userId) return { error: "User not found" };

    // Create the partition key based on store and user
    const partitionKeyValue = [userId];
    
    // Check if an address already exists for this user/store
    const querySpec = {
      query: "SELECT c.id, c.formattedAddress, c.street, c.houseNumber, c.city, c.zipCode, c.country, c.additionalInfo, c.coordinates, c.createdAt FROM c WHERE c.userId = @userId",
      parameters: [
        { name: "@userId", value: userId }
      ]
    };

    const { resources: existingAddresses } = await containerDeliveryLocations.items
      .query(querySpec, { partitionKey: partitionKeyValue })
      .fetchAll();

    const now = new Date().toISOString();
    
    if (existingAddresses && existingAddresses.length > 0) {
      // Update existing address
      const existingAddress = existingAddresses[0];

      const updatedAddress: DeliveryAddress = {
        id: existingAddress.id,
        userId: userId,
        ...sanitizedAddress,
        createdAt: existingAddress.createdAt,
        updatedAt: now
      }
      
      await containerDeliveryLocations.item(existingAddress.id, partitionKeyValue).replace(updatedAddress);

    } else {
      // Create new address
      const newAddress: DeliveryAddress = {
        id: uuidv4(),
        userId,
        ...sanitizedAddress,
        createdAt: now
      };
      
      await containerDeliveryLocations.items.create(newAddress);
    }
    
    revalidateTag('delivery-address');
    return { success: "Delivery address updated successfully" };
  } catch (error: any) {
    console.error("Error updating delivery address:", error);
    return { error: "Failed to update delivery address" };
  }
}

/**
 * Retrieves the delivery address for a user in a specific store
 */
export async function getDeliveryAddress(userId: string): Promise<DeliveryAddress | null> {
  try {

    // Create the partition key based on store and user
    const partitionKeyValue = [userId];
    
    // Query for the address
    const querySpec = {
      query: "SELECT c.id, c.formattedAddress, c.street, c.houseNumber, c.city, c.zipCode, c.country, c.additionalInfo, c.coordinates, c.createdAt FROM c WHERE c.userId = @userId",
      parameters: [
        { name: "@userId", value: userId }
      ]
    };

    const { resources: addresses } = await containerDeliveryLocations.items
      .query(querySpec, { partitionKey: partitionKeyValue })
      .fetchAll();
    
    return addresses && addresses.length > 0 ? addresses[0] : null;
  } catch (error: any) {
    console.error("Error fetching delivery address:", error);
    return null;
  }
}


export async function getCurrentDeliveryAddress(): Promise<DeliveryAddress | null> {
  try {
    // Get user ID from session or use guest ID
    const session = await getCurrentSession();
    let userId;
    if (!session || !session.user) {
      userId = await getSessionCookie();
    } else {
      userId = session.user.id;
    }
    
    if (!userId) return null;
    
    const result = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/delivery-address/${userId}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      next: {
        tags: ['delivery-address'],
        revalidate: 300
      },
    });


    if (!result.ok) {
      throw new Error("Failed to fetch current delivery address");
    }


    const data = await result.json();
    return data;

  } catch (error: any) {
    console.error("Error fetching current delivery address:", error);
    return null;
  }
}