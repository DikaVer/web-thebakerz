/**
 * @fileoverview API route handling GET /api/store/[storeId], which returns general store data.
 *
 * Resolves the store by name or ID via getStoreDataByStoreNameOrId and returns the store
 * record as JSON, or null when not found. Accepts GET requests with a Bearer token in the
 * Authorization header and is rate limited via globalGETRateLimit.
 */
import { NextResponse } from 'next/server';
import {getStoreDataByStoreNameOrId} from "@/lib/actions/store";
import { getTranslations } from "next-intl/server";
import { globalGETRateLimit } from '@/lib/utils/helper/requests';
import { checkBearerToken } from '@/lib/utils/helper/bearerChecker';

export async function GET(request: Request, { params }: { params: Promise<{ storeId: string }> }) {
    const t = await getTranslations("app/api/store");

    const { storeId } = await params;

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

        const storeData = await getStoreDataByStoreNameOrId(storeId);

        if (!storeData) {
            return NextResponse.json(null);
        }

        return NextResponse.json(storeData, { status: 200 });
    } catch (error) {
        console.error('Error validating session:', error);
        return NextResponse.json(
            { error: t("internalError") },
            { status: 500 }
        );
    }
}
