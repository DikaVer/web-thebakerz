/**
 * @fileoverview API route handling GET /api/store/[storeId]/products/[productId], which returns a single product.
 *
 * Fetches the product identified by store ID and product ID via
 * getProductByStoreIdAndProductId and returns it as JSON. Accepts GET requests with a
 * Bearer token in the Authorization header and is rate limited via globalGETRateLimit.
 */
import { NextResponse } from 'next/server';
import {getProductByStoreIdAndProductId} from "@/lib/actions/product";
import { getTranslations } from "next-intl/server";
import { globalGETRateLimit } from '@/lib/utils/helper/requests';
import { checkBearerToken } from '@/lib/utils/helper/bearerChecker';

export async function GET(
    request: Request,
    { params }: { params: Promise<{ storeId: string; productId: string;}> }
) {
    const t = await getTranslations("app/api/store/products/productId");
    const { storeId, productId } = await params;

    if (!(await globalGETRateLimit())) {
        return NextResponse.json(
            { error: "Too many requests" },
            { status: 429 }
        );
    }

    // Check bearer token authentication
    const authError = await checkBearerToken(request);
    if (authError) {
        return authError;
    }

    try {
        // Call your validation logic with the extracted token
        const productData = await getProductByStoreIdAndProductId(storeId, productId);
        return NextResponse.json(productData, { status: 200 });
    } catch (error) {
        console.error('Error validating session:', error);
        return NextResponse.json(
            { error: t("internalError") },
            { status: 500 }
        );
    }
}