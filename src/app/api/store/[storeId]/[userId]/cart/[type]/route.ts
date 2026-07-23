/**
 * @fileoverview API route handling GET /api/store/[storeId]/[userId]/cart/[type], which retrieves a user's cart of a given type.
 *
 * Fetches the cart for the given user, store, and cart type via getCart and returns it as
 * JSON; the type path parameter must be either "delivery" or "pickup". Requires bearer token
 * authentication via the Authorization header and is rate limited via globalGETRateLimit.
 */
import { NextResponse } from 'next/server';
import { getCart} from "@/lib/actions/cart";
import { getTranslations } from "next-intl/server";
import { globalGETRateLimit } from '@/lib/utils/helper/requests';
import { checkBearerToken } from '@/lib/utils/helper/bearerChecker';
export async function GET(request: Request, { params }: { params: Promise<{ storeId: string, userId: string, type: string }> }) {
    const t = await getTranslations("app/api/store/cart");

    if (!(await globalGETRateLimit())) {
        return NextResponse.json(
            { error: "Too many requests" },
            { status: 429 }
        );
    }

    const { storeId, userId, type } = await params;

    if (type !== 'delivery' && type !== 'pickup') {
        return NextResponse.json({ error: "Invalid type" }, { status: 400 });
    }

    const authError = await checkBearerToken(request);
     if (authError) {
         return authError;
     }

    try {
        // Fetch and return cart data
        const cartData = await getCart(userId, storeId, type);
        return NextResponse.json(cartData, { status: 200 });
    } catch (error) {
        console.error('Error validating session:', error);
        return NextResponse.json({ error: t("internalError") }, { status: 500 });
    }
}