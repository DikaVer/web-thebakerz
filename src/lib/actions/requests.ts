import { headers } from "next/headers";
import { RefillingTokenBucket } from "@/lib/actions/rate-limits";

export const globalBucket = new RefillingTokenBucket<string>(10, 1);

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
    return globalBucket.consume(clientIP, 10);
}
