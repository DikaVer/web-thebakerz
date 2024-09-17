import {kv} from "@vercel/kv";
import {AddressDataStorageField} from "@/lib/definitions";

/**
 * Retrieves checkout settings for the current session. If none exist, default settings are created.
 * @returns {Promise<AddressDataStorageField>} The checkout settings for the current session.
 */
export async function fetchAddressData(addressId: string) {
    const key = `session-address-${addressId}`;

    return await kv.hgetall(key);
}

/**
 * Updates the checkout settings for the current session.
 * @param {AddressDataStorageField} settings - The new checkout settings to be applied.
 * @param addressId - The session ID to update the settings for.
 */
export async function setAddressData(settings: AddressDataStorageField, addressId: string): Promise<void> {
    const key = `session-address-${addressId}`;

    try {
        await kv.hset(key, settings);
    } catch (error) {
        console.error('Error updating checkout settings:', error);
        throw error;
    }
}