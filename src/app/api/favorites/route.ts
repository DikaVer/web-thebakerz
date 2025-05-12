import { NextResponse } from 'next/server';
import { getTranslations } from "next-intl/server";
import { getStoreFavorites } from '@/lib/actions/favorites';
import { getProductFavoritesByStore } from '@/lib/actions/favorites';
import { getProductFavorites } from '@/lib/actions/favorites';

/**
 * API Route: GET /api/favorites
 * -----------------------------------------------------------------------------------
 * Retrieves all favorites for a specific user.
 *
 * Required Headers:
 * - User-Id: Identifier for the user
 * - Authorization: Bearer token for API authentication
 *
 * @returns {Promise<NextResponse>} JSON response with favorites data or error message
 */
export async function GET(request: Request) {
    
    // Extract and validate required headers
    const userId = request.headers.get('User-Id');
    const authHeader = request.headers.get('Authorization');
    const purpose = request.headers.get('Purpose');
    const storeId = request.headers.get('Store-Id');

    // Check for missing headers and return appropriate errors
    if (!userId) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!purpose) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!authHeader) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Validate bearer token
    const token = authHeader.replace('Bearer ', '').trim();
    if (token !== process.env.NEXT_PRIVATE_SECRET_BEARER) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
    
        if(purpose === "getStoreFavorites") {
            const storeFavorites = await getStoreFavorites(userId);
            return NextResponse.json(storeFavorites, { status: 200 });
        }
        if(purpose === "getProductFavorites") {
            const productFavorites = await getProductFavorites(userId);
            return NextResponse.json(productFavorites, { status: 200 });
        }
        if(purpose === "getProductFavoritesByStore") {
            if(!storeId) {
                return NextResponse.json({ error: "Store-Id is required" }, { status: 400 });
            }
            const productFavorites = await getProductFavoritesByStore(storeId, userId);
            return NextResponse.json(productFavorites, { status: 200 });
        }   
    } catch (error) {
        console.error('Error retrieving favorites:', error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
