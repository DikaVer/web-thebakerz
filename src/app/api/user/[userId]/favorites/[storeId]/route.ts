/**
 * @fileoverview API route handling GET /api/user/[userId]/favorites/[storeId], which lists a user's favorite products in one store.
 *
 * Fetches the user's product favorites scoped to the given store via
 * getProductFavoritesByStore and returns them as JSON. Requires bearer token authentication
 * via the Authorization header and is rate limited via globalGETRateLimit.
 */
import { NextResponse } from 'next/server';
import { getProductFavoritesByStore } from '@/lib/actions/favorites';
import { checkBearerToken } from '@/lib/utils/helper/bearerChecker';
import { globalGETRateLimit } from '@/lib/utils/helper/requests';

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
