/**
 * @fileoverview Global per-IP rate limiting helpers for server requests.
 *
 * Uses a shared RefillingTokenBucket keyed by the client's x-forwarded-for
 * address and exports globalGETRateLimit, globalPOSTRateLimit, and
 * globalLargeRateLimit, which consume 1, 3, and 80 tokens respectively.
 * Requests without a client IP header are always allowed.
 */
import { headers } from "next/headers";
import { RefillingTokenBucket } from "@/lib/utils/helper/rate-limits";

export const globalBucket = new RefillingTokenBucket<string>(100, 1);

// Return a promise that resolves to a boolean.
export async function globalGETRateLimit(): Promise<boolean> {
    // Await the headers() call.
    const reqHeaders = await headers();
    const clientIP = reqHeaders.get("x-forwarded-for");
    if (clientIP === null) {
        return true;
    }
    return globalBucket.consume(clientIP, 1);
}

export async function globalPOSTRateLimit(): Promise<boolean> {
    const reqHeaders = await headers();
    const clientIP = reqHeaders.get("x-forwarded-for");
    if (clientIP === null) {
        return true;
    }
    return globalBucket.consume(clientIP, 3);
}

export async function globalLargeRateLimit(): Promise<boolean> {
    const reqHeaders = await headers();
    const clientIP = reqHeaders.get("x-forwarded-for");
    if (clientIP === null) {
        return true;
    }
    return globalBucket.consume(clientIP, 80);
}
