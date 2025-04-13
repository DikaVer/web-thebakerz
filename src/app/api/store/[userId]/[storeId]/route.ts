
import { NextRequest, NextResponse } from "next/server";
import { getDeliveryAddress } from "@/app/(store)/[id]/delivery-actions";
import {getStoreByUserIdAndStoreId} from "@/lib/actions/store";

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ storeId: string, userId: string }> }
) {
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
