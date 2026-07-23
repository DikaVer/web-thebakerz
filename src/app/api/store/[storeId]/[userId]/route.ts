/**
 * @fileoverview API route handling GET /api/store/[storeId]/[userId], which returns store data scoped to an owner.
 *
 * Fetches the store matching both the given store ID and owner user ID via
 * getStoreByUserIdAndStoreId and returns it as JSON, or null when no match exists. Requires
 * bearer token authentication and is rate limited via globalGETRateLimit.
 */
import { NextRequest, NextResponse } from "next/server";
import {getStoreByUserIdAndStoreId} from "@/lib/actions/store";
import { globalGETRateLimit } from "@/lib/utils/helper/requests";
import { checkBearerToken } from "@/lib/utils/helper/bearerChecker";
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ storeId: string, userId: string }> }
) {

    if (!(await globalGETRateLimit())) {
        return NextResponse.json(
            { error: "Too many requests" },
            { status: 429 }
        );
    }

     // Check bearer token authentication
     const authError = await checkBearerToken(request);
     if (authError) {
         return authError;
     }

    try {
        const { storeId, userId } = await params;

        // Get delivery address using the helper function
        const storeData = await getStoreByUserIdAndStoreId(userId, storeId);

        if (!storeData) {
            return NextResponse.json(null);
        }

        return NextResponse.json(storeData);

    } catch (error) {
        console.error("Error in delivery address API route:", error);
        return NextResponse.json(
            { error: "Failed to fetch delivery address" },
            { status: 500 }
        );
    }
}
