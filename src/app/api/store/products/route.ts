import { NextResponse } from 'next/server';
import {getProductsByStoreId} from "@/lib/actions/product";
import { getTranslations } from "next-intl/server";

// This API route accepts GET requests with a Bearer token in the Authorization header.
export async function GET(request: Request) {
    const t = await getTranslations("app/api/store/products");
    
    // Retrieve the Authorization header
    const id = request.headers.get('Store-Id');
    if (!id) {
        return NextResponse.json(
            { error: t("missingStoreId") },
            { status: 401 }
        );
    }

    const authHeader = request.headers.get('Authorization');
    if (!authHeader) {
        return NextResponse.json(
            { error: t("missingAuth") },
            { status: 401 }
        );
    }

    const token = authHeader.replace('Bearer ', '').trim();
    if (token !== process.env.NEXT_PRIVATE_SECRET_BEARER) {
        return NextResponse.json(
            { error: t("notAuthorized") },
            { status: 401 }
        );
    }

    try {
        // Call your validation logic with the extracted token
        const productsData = await getProductsByStoreId(id);
        return NextResponse.json(productsData, { status: 200 });
    } catch (error) {
        console.error('Error validating session:', error);
        return NextResponse.json(
            { error: t("internalError") },
            { status: 500 }
        );
    }
}
