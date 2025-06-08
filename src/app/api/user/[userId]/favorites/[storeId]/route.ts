import { NextResponse } from 'next/server';
import { getProductFavoritesByStore } from '@/lib/actions/favorites';
import { checkBearerToken } from '@/lib/utils/helper/bearerChecker';
import { globalGETRateLimit } from '@/lib/utils/helper/requests';

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
export async function GET(request: Request, { params }: { params: Promise<{ userId: string, storeId: string }> }) {

    if (!(await globalGETRateLimit())) {
        return NextResponse.json(
            { error: "Too many requests" },
            { status: 429 }
        );
    }
    
    const { userId, storeId } = await params;

    // Check bearer token authentication
    const authError = await checkBearerToken(request);
    if (authError) {
        return authError;
    }

    try {

        const productFavorites = await getProductFavoritesByStore(storeId, userId);
        return NextResponse.json(productFavorites, { status: 200 });
        
    } catch (error) {
        console.error('Error retrieving favorites:', error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
