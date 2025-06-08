import { NextResponse } from 'next/server';
import { getTranslations } from "next-intl/server";
import { getStoreFavorites } from '@/lib/actions/favorites';
import { getProductFavoritesByStore } from '@/lib/actions/favorites';
import { getProductFavorites } from '@/lib/actions/favorites';
import { globalGETRateLimit } from '@/lib/utils/helper/requests';
import { checkBearerToken } from '@/lib/utils/helper/bearerChecker';

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
export async function GET(request: Request, { params }: { params: Promise<{ userId: string }> }) {
    
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
    
        const storeFavorites = await getStoreFavorites(userId);
        return NextResponse.json(storeFavorites, { status: 200 });
 
    } catch (error) {
        console.error('Error retrieving favorites:', error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
