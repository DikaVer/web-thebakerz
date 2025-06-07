import { NextResponse } from 'next/server';
import {getProductsByStoreId} from "@/lib/actions/product";
import { getTranslations } from "next-intl/server";
import { globalGETRateLimit } from '@/lib/utils/helper/requests';
import { checkBearerToken } from '@/lib/utils/helper/bearerChecker';

// This API route accepts GET requests with a Bearer token in the Authorization header.
export async function GET(request: Request, { params }: { params: Promise<{ storeId: string }> }) {
    const t = await getTranslations("app/api/store/products");

    if (!(await globalGETRateLimit())) {
        return NextResponse.json(
            { error: "Too many requests" },
            { status: 429 }
        );
    }

    const { storeId } = await params;
    // Check bearer token authentication
    const authError = await checkBearerToken(request);
    if (authError) {
        return authError;
    }

    try {
        // Call your validation logic with the extracted storeId
        const productsData = await getProductsByStoreId(storeId);
        return NextResponse.json(productsData, { status: 200 });
    } catch (error) {
        console.error('Error validating session:', error);
        return NextResponse.json(
            { error: t("internalError") },
            { status: 500 }
        );
    }
}
