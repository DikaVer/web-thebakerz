import { NextResponse } from 'next/server';
import { getAllCart, } from "@/lib/actions/cart";
import { getTranslations } from "next-intl/server";
import { globalGETRateLimit } from '@/lib/utils/helper/requests';
import { checkBearerToken } from '@/lib/utils/helper/bearerChecker';
/**
 * API Route: GET /api/store/cart
 * -----------------------------------------------------------------------------------
 * Retrieves cart data for a specific user in a specific store.
 *
 * Required Headers:
 * - Store-Id: Identifier for the store
 * - User-Id: Identifier for the user
 * - Authorization: Bearer token for API authentication
 *
 * @returns {Promise<NextResponse>} JSON response with cart data or error message
 */
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