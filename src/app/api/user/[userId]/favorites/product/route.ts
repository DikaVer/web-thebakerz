/**
 * @fileoverview API route handling GET /api/user/[userId]/favorites/product, which lists a user's favorite products.
 *
 * Fetches all product favorites for the given user via getProductFavorites and returns them
 * as JSON. Requires bearer token authentication via the Authorization header and is rate
 * limited via globalGETRateLimit.
 */
import { NextResponse } from 'next/server';
import { getTranslations } from "next-intl/server";
import { getStoreFavorites } from '@/lib/actions/favorites';
import { getProductFavoritesByStore } from '@/lib/actions/favorites';
import { getProductFavorites } from '@/lib/actions/favorites';
import { globalGETRateLimit } from '@/lib/utils/helper/requests';
import { checkBearerToken } from '@/lib/utils/helper/bearerChecker';

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
    
        const productFavorites = await getProductFavorites(userId);
        return NextResponse.json(productFavorites, { status: 200 });
    } catch (error) {
        console.error('Error retrieving favorites:', error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
