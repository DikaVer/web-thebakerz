/**
 * @fileoverview API route handling GET /api/user/[userId]/business, which returns a user's business record.
 *
 * Fetches business data for the given user ID via getBusinessByUserId and returns it as
 * JSON. Accepts GET requests with a Bearer token in the Authorization header and is rate
 * limited via globalGETRateLimit.
 */
import { NextResponse } from 'next/server';
import {getBusinessByUserId} from "@/lib/actions/business";
import { getTranslations } from "next-intl/server";
import { globalGETRateLimit } from '@/lib/utils/helper/requests';
import { checkBearerToken } from '@/lib/utils/helper/bearerChecker';

export async function GET(request: Request, { params }: { params: Promise<{ userId: string }> }) {
    const t = await getTranslations("app/api/store");

    if (!(await globalGETRateLimit())) {
        return NextResponse.json(
            { error: "Too many requests" },
            { status: 429 }
        );
    }

    const { userId } = await params;

    // Check bearer token authentication
    const authError = await checkBearerToken(request);
    if (authError) {
        return authError;
    }

    try {
        // Call your validation logic with the extracted token
        const storeData = await getBusinessByUserId(userId);
        return NextResponse.json(storeData, { status: 200 });
    } catch (error) {
        console.error('Error validating session:', error);
        return NextResponse.json(
            { error: t("internalError") },
            { status: 500 }
        );
    }
}
