/**
 * @fileoverview API route handling GET /api/store/[storeId]/business, which returns a store's business data.
 *
 * Fetches business information for the given store via getBusinessStoreData and returns it
 * as JSON, or null when not found. Accepts GET requests with a Bearer token in the
 * Authorization header and is rate limited via globalGETRateLimit.
 */
import { NextResponse } from 'next/server';
import {getBusinessStoreData} from "@/lib/actions/store";
import { getTranslations } from "next-intl/server";
import { globalGETRateLimit } from '@/lib/utils/helper/requests';
import { checkBearerToken } from '@/lib/utils/helper/bearerChecker';
export async function GET(request: Request, { params }: { params: Promise<{ storeId: string }> }) {
    const t = await getTranslations("app/api/store");

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
        const { storeId } = await params;
        const storeData = await getBusinessStoreData(storeId);

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
