import { NextResponse } from 'next/server';
import {getProductsByStoreId} from "@/lib/actions/product";
import {getProductsOrder} from "@/lib/actions/order-products";
import { getTranslations } from "next-intl/server";
import { globalGETRateLimit } from '@/lib/utils/helper/requests';
import { checkBearerToken } from '@/lib/utils/helper/bearerChecker';

// This API route accepts GET requests with a Bearer token in the Authorization header.
export async function GET(request: Request) {
    const t = await getTranslations("app/api/store/products-order");

    if (!(await globalGETRateLimit())) {
        return NextResponse.json(
            { error: "Too many requests" },
            { status: 429 }
        );
    }
    
    // Retrieve the Authorization header
    const id = request.headers.get('Store-Id');
    if (!id) {
        return NextResponse.json(
            { error: t("missingStoreId") },
            { status: 401 }
        );
    }

    const authError = await checkBearerToken(request);
    if (authError) {
        return authError;
    }

    try {
        // Call your validation logic with the extracted token
        const productsOrder = await getProductsOrder(id)
        return NextResponse.json(productsOrder, { status: 200 });
    } catch (error) {
        console.error('Error validating session:', error);
        return NextResponse.json(
            { error: t("internalError") },
            { status: 500 }
        );
    }
}
