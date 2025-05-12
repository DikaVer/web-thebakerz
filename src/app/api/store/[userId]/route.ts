import { NextRequest, NextResponse } from "next/server";
import {getStoreByUserId} from "@/lib/actions/store";
import {getTranslations} from "next-intl/server";
import { globalGETRateLimit } from "@/lib/actions/requests";
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

    try {
        const { userId } = await params;

        const t = await getTranslations("app/api/store");

        const authHeader = request.headers.get('Authorization');
        if (!authHeader) {
            return NextResponse.json(
                { error: t("missingAuth") },
                { status: 401 }
            );
        }

        const token = authHeader.replace('Bearer ', '').trim();
        if (token !== process.env.NEXT_PRIVATE_SECRET_BEARER) {
            return NextResponse.json(
                { error: t("notAuthorized") },
                { status: 401 }
            );
        }

        // Get delivery address using the helper function
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
