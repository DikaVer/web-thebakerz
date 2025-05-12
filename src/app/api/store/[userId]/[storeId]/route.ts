
import { NextRequest, NextResponse } from "next/server";
import {getStoreByUserIdAndStoreId} from "@/lib/actions/store";
import { globalGETRateLimit } from "@/lib/actions/requests";
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
