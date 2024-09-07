'use server';
import "server-only";
import { cookies } from "next/headers";
import { kv } from "@vercel/kv";
import {getCart} from "@/lib/store/store-dto";

type SessionId = string;

function getSessionId(): SessionId | undefined {
    const cookieStore = cookies();
    return cookieStore.get("session-id")?.value;
}

function setSessionId(sessionId: SessionId): void {
    const cookieStore = cookies();
    cookieStore.set("session-id", sessionId);
}

//Delete the session id cookie
export async function deleteSessionId() {
    const cookieStore = cookies();
    cookieStore.delete("session-id");
}

export async function getSessionIdAndCreateIfMissing() {
    const sessionId = getSessionId();
    if (!sessionId) {
        const newSessionId = crypto.randomUUID();
        setSessionId(newSessionId);

        return newSessionId;
    }

    return sessionId;
}

// export async function get(key: string, namespace: string = "") {
//     const sessionId = await getSessionId();
//     if (!sessionId) {
//         return null;
//     }
//     const cartData = await kv.hget(`session-${namespace}-${sessionId}`, key);
// }

export async function getAll() {
    const sessionId = getSessionId();
    if (!sessionId) {
        return null;
    }
    const cartData = await kv.hgetall(`session-${sessionId}`);

    if (cartData) {
        return await getCart(cartData);
    } else {
        return null;
    }
}

export async function updateProductCart(productId: string, amount: number) {
    const sessionId = await getSessionIdAndCreateIfMissing();
    const key = `session-${sessionId}`;

    try {
        // If the amount is greater than 0, add or update the product
        if (amount > 0) {
            await kv.hset(key, { [productId]: amount }); // Correctly passing the field-value pair as an object
        } else {
            // If amount is 0 or less, remove the product
            await kv.hdel(key, productId);
        }
    } catch (error) {
        console.error("Error updating product cart:", error);
        throw error; // Optionally rethrow the error if you want upstream handling
    }
}


