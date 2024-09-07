'use server';
import 'server-only';
import { cookies } from 'next/headers';
import { kv } from '@vercel/kv';
import { getCart } from '@/lib/store/store-dto';

type SessionId = string;

/**
 * Retrieves the current session ID from cookies.
 * @returns {SessionId | undefined} The session ID if available, otherwise undefined.
 */
function getSessionId(): SessionId | undefined {
    return cookies().get('session-id')?.value;
}

/**
 * Sets a new session ID in the cookies.
 * @param {SessionId} sessionId - The session ID to be set.
 */
function setSessionId(sessionId: SessionId): void {
    cookies().set('session-id', sessionId);
}

/**
 * Deletes the session ID cookie.
 */
export async function deleteSessionId(): Promise<void> {
    cookies().delete('session-id');
}

/**
 * Retrieves the session ID. If it does not exist, a new one is created and stored in cookies.
 * @returns {Promise<SessionId>} The existing or newly created session ID.
 */
export async function getSessionIdAndCreateIfMissing(): Promise<SessionId> {
    let sessionId = getSessionId();

    if (!sessionId) {
        sessionId = crypto.randomUUID();
        setSessionId(sessionId);
    }

    return sessionId;
}

/**
 * Retrieves all cart data for the current session.
 * @returns {Promise<any | null>} The cart data or null if none exists.
 */
export async function getAll(): Promise<any | null> {
    const sessionId = getSessionId();

    if (!sessionId) {
        return null;
    }

    const cartData = await kv.hgetall(`session-${sessionId}`);

    return cartData ? await getCart(cartData) : null;
}

/**
 * Updates the product cart for the current session.
 * Adds or updates a product if the amount is greater than 0,
 * otherwise removes it from the cart.
 * @param {string} productId - The ID of the product to update.
 * @param {number} amount - The amount of the product. If 0 or less, the product is removed.
 * @throws Will throw an error if updating the cart fails.
 */
export async function updateProductCart(productId: string, amount: number): Promise<void> {
    const sessionId = await getSessionIdAndCreateIfMissing();
    const key = `session-${sessionId}`;

    try {
        if (amount > 0) {
            await kv.hset(key, { [productId]: amount });
        } else {
            await kv.hdel(key, productId);
        }
    } catch (error) {
        console.error('Error updating product cart:', error);
        throw error;
    }
}
