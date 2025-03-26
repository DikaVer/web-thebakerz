import { NextResponse } from 'next/server';
import { getCart } from "@/lib/actions/cart";
import { getTranslations } from "next-intl/server";

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
export async function GET(request: Request) {
    const t = await getTranslations("app/api/store/cart");
    
    // Extract and validate required headers
    const storeId = request.headers.get('Store-Id');
    const userId = request.headers.get('User-Id');
    const authHeader = request.headers.get('Authorization');

    // Check for missing headers and return appropriate errors
    if (!storeId) {
        return NextResponse.json({ error: t("missingStoreId") }, { status: 401 });
    }

    if (!userId) {
        return NextResponse.json({ error: t("missingUserId") }, { status: 401 });
    }

    if (!authHeader) {
        return NextResponse.json({ error: t("missingAuth") }, { status: 401 });
    }

    // Validate bearer token
    const token = authHeader.replace('Bearer ', '').trim();
    if (token !== process.env.NEXT_PRIVATE_SECRET_BEARER) {
        return NextResponse.json({ error: t("notAuthorized") }, { status: 401 });
    }

    try {
        // Fetch and return cart data
        const cartData = await getCart(userId, storeId);
        return NextResponse.json(cartData, { status: 200 });
    } catch (error) {
        console.error('Error validating session:', error);
        return NextResponse.json({ error: t("internalError") }, { status: 500 });
    }
}