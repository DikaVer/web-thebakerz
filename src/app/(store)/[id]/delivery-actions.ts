"use server";

import { containerDeliveryLocations  } from "@/db";
import { getCartSessionCookieOrCreate, getCartSessionCookie, getCurrentSession } from "@/lib/actions/session";
import { MAX_CHARS_ADDRESS } from "@/lib/schemas/address.schema";
import { revalidateTag } from "next/cache";
import { v4 as uuidv4 } from "uuid";


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

export interface DeliveryAddress extends DeliveryAddressRaw {
  id: string;
  storeId: string;
  userId: string;
  createdAt: string;
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
  storeId: string,
  address: DeliveryAddressRaw
): Promise<{ success?: string; error?: string }> {
  try {
    // Validate and truncate input fields
    const sanitizedAddress = {
      ...address,
      formattedAddress: truncateField(address.formattedAddress, MAX_CHARS_ADDRESS.formattedAddress),
      street: truncateField(address.street, MAX_CHARS_ADDRESS.street),
      houseNumber: truncateField(address.houseNumber, MAX_CHARS_ADDRESS.houseNumber),
      city: truncateField(address.city, MAX_CHARS_ADDRESS.city),
      zipCode: truncateField(address.zipCode, MAX_CHARS_ADDRESS.zipCode),
      additionalInfo: truncateField(address.additionalInfo, MAX_CHARS_ADDRESS.additionalInfo)
    };

    // Get user ID from session or use guest ID
    const session = await getCurrentSession();
    let userId;
    if (!session || !session.user) {
      userId = await getCartSessionCookieOrCreate();
    } else {
      userId = session.user.id;
    }
    
    if (!userId) return { error: "User not found" };

    // Create the partition key based on store and user
    const partitionKeyValue = [storeId, userId];
    
    // Check if an address already exists for this user/store
    const querySpec = {
      query: "SELECT c.id, c.formattedAddress, c.street, c.houseNumber, c.city, c.zipCode, c.country, c.additionalInfo, c.coordinates, c.createdAt FROM c WHERE c.storeId = @storeId AND c.userId = @userId",
      parameters: [
        { name: "@storeId", value: storeId },
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
        ...existingAddress,
        storeId: storeId,
        userId: userId,
        formattedAddress: sanitizedAddress.formattedAddress,
        street: sanitizedAddress.street,
        houseNumber: sanitizedAddress.houseNumber,
        city: sanitizedAddress.city,
        zipCode: sanitizedAddress.zipCode,
        additionalInfo: sanitizedAddress.additionalInfo,
        coordinates: sanitizedAddress.coordinates,
        updatedAt: now
      }
      
      await containerDeliveryLocations.item(existingAddress.id, partitionKeyValue).replace(updatedAddress);

    } else {
      // Create new address
      const newAddress: DeliveryAddress = {
        id: uuidv4(),
        storeId,
        userId,
        formattedAddress: sanitizedAddress.formattedAddress,
        street: sanitizedAddress.street,
        houseNumber: sanitizedAddress.houseNumber,
        city: sanitizedAddress.city,
        zipCode: sanitizedAddress.zipCode,
        country: sanitizedAddress.country,
        additionalInfo: sanitizedAddress.additionalInfo,
        coordinates: sanitizedAddress.coordinates,
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
export async function getDeliveryAddress(storeId: string, userId: string): Promise<DeliveryAddress | null> {
  try {

    // Create the partition key based on store and user
    const partitionKeyValue = [storeId, userId];
    
    // Query for the address
    const querySpec = {
      query: "SELECT c.id, c.formattedAddress, c.street, c.houseNumber, c.city, c.zipCode, c.country, c.additionalInfo, c.coordinates, c.createdAt FROM c WHERE c.storeId = @storeId AND c.userId = @userId",
      parameters: [
        { name: "@storeId", value: storeId },
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


export async function getCurrentDeliveryAddress(storeId: string): Promise<DeliveryAddress | null> {
  try {
    // Get user ID from session or use guest ID
    const session = await getCurrentSession();
    let userId;
    if (!session || !session.user) {
      userId = await getCartSessionCookie();
    } else {
      userId = session.user.id;
    }
    
    if (!userId) return null;
    
    const result = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/store/delivery-address/${storeId}/${userId}`, {
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

/**
 * Replace guest delivery address with the logged-in user's delivery address.
 * If the user already has an address, it's preserved. Otherwise, the guest address is migrated.
 */
// export async function replaceGuestDeliveryAddress(
//   storeId: string
// ): Promise<{ success?: string; error?: string }> {
//   try {
//     const session = await getCurrentSession();

//     if (!session || !session.user) {
//       return { error: "User session not recognized" };
//     }

//     const userId = session.user.id;
//     const guestId = await getCartSessionCookie();
    
//     if (!guestId) {
//       return { success: "No guest address to migrate" };
//     }

//     const guestPartitionKey = [storeId, guestId];
//     const userPartitionKey = [storeId, userId];

//     // Check if user already has an address
//     const userQuerySpec = {
//       query: "SELECT c.id, c.formattedAddress, c.street, c.houseNumber, c.city, c.zipCode, c.country, c.additionalInfo, c.coordinates, c.createdAt FROM c WHERE c.storeId = @storeId AND c.userId = @userId",
//       parameters: [
//         { name: "@storeId", value: storeId },
//         { name: "@userId", value: userId }
//       ]
//     };

//     const { resources: userAddresses } = await containerDeliveryLocations.items
//       .query(userQuerySpec, { partitionKey: userPartitionKey })
//       .fetchAll();

//     // If user already has an address, don't replace it
//     if (userAddresses && userAddresses.length > 0) {
//       // Delete guest address if it exists
//       const guestQuerySpec = {
//         query: "SELECT c.id, c.formattedAddress, c.street, c.houseNumber, c.city, c.zipCode, c.country, c.additionalInfo, c.coordinates, c.createdAt FROM c WHERE c.storeId = @storeId AND c.userId = @guestId",
//         parameters: [
//           { name: "@storeId", value: storeId },
//           { name: "@guestId", value: guestId }
//         ]
//       };

//       const { resources: guestAddresses } = await containerDeliveryLocations.items
//         .query(guestQuerySpec, { partitionKey: guestPartitionKey })
//         .fetchAll();

//       if (guestAddresses && guestAddresses.length > 0) {
//         await containerDeliveryLocations.item(guestAddresses[0].id, guestPartitionKey).delete();
//       }

//       return { success: "User address preserved, guest address removed" };
//     }

//     // Get guest address
//     const guestQuerySpec = {
//       query: "SELECT c.id, c.formattedAddress, c.street, c.houseNumber, c.city, c.zipCode, c.country, c.additionalInfo, c.coordinates, c.createdAt FROM c WHERE c.storeId = @storeId AND c.userId = @guestId",
//       parameters: [
//         { name: "@storeId", value: storeId },
//         { name: "@guestId", value: guestId }
//       ]
//     };

//     const { resources: guestAddresses } = await containerDeliveryLocations.items
//       .query(guestQuerySpec, { partitionKey: guestPartitionKey })
//       .fetchAll();

//     // If guest has an address, migrate it to the user
//     if (guestAddresses && guestAddresses.length > 0) {
//       const guestAddress = guestAddresses[0];
      
//       // Create new address for user
//       const newAddress: DeliveryAddress = {
//         ...guestAddress,
//         id: uuidv4(),
//         userId: userId,
//         createdAt: new Date().toISOString()
//       };
      
//       await containerDeliveryLocations.items.create(newAddress);
      
//       // Delete guest address
//       await containerDeliveryLocations.item(guestAddress.id, guestPartitionKey).delete();
      
//       revalidateTag('delivery-address');
//       return { success: "Guest delivery address migrated to user account" };
//     }

//     return { success: "No guest address found to migrate" };
//   } catch (error: any) {
//     console.error("Error replacing guest delivery address:", error);
//     return { error: "Failed to replace guest delivery address" };
//   }
// } 