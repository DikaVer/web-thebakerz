import { NextRequest, NextResponse } from "next/server";
import {getStoreByUserId} from "@/lib/actions/store";
import { globalGETRateLimit } from "@/lib/utils/helper/requests";
import { checkBearerToken } from "@/lib/utils/helper/bearerChecker";
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ userId: string }> }
) {
    if (!(await globalGETRateLimit())) {
        return NextResponse.json(
            { error: "Too many requests" },
            { status: 429 }
        );
    }

    const authError = await checkBearerToken(request);
     if (authError) {
         return authError;
     }

    try {
        const { userId } = await params;

        const storeData = await getStoreByUserId(userId);

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
