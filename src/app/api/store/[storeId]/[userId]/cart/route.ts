/**
 * @fileoverview API route handling GET /api/store/[storeId]/[userId]/cart, which retrieves a user's full cart for a store.
 *
 * Fetches all cart data (both delivery and pickup) for the given user and store via
 * getAllCart and returns it as JSON. Requires bearer token authentication via the
 * Authorization header and is rate limited via globalGETRateLimit.
 */
import { NextResponse } from 'next/server';
import { getAllCart, } from "@/lib/actions/cart";
import { getTranslations } from "next-intl/server";
import { globalGETRateLimit } from '@/lib/utils/helper/requests';
import { checkBearerToken } from '@/lib/utils/helper/bearerChecker';
export async function GET(request: Request, { params }: { params: Promise<{ storeId: string, userId: string }> }) {
    const t = await getTranslations("app/api/store/cart");

    if (!(await globalGETRateLimit())) {
        return NextResponse.json(
            { error: "Too many requests" },
            { status: 429 }
        );
    }

    const { storeId, userId } = await params;

    const authError = await checkBearerToken(request);
     if (authError) {
         return authError;
     }

    try {
        // Fetch and return cart data
        const cartData = await getAllCart(userId, storeId);
        return NextResponse.json(cartData, { status: 200 });
    } catch (error) {
        console.error('Error validating session:', error);
        return NextResponse.json({ error: t("internalError") }, { status: 500 });
    }
}