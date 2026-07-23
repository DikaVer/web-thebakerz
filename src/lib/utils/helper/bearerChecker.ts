/**
 * @fileoverview Bearer token authentication check for API routes.
 *
 * Exports checkBearerToken, which compares the request's Authorization header
 * against the NEXT_PRIVATE_SECRET_BEARER environment variable and returns a
 * translated 401 JSON NextResponse when the header is missing or invalid, or
 * null when authentication succeeds.
 */
import { NextResponse } from 'next/server';
import { getTranslations } from "next-intl/server";

export async function checkBearerToken(request: Request) {
    const t = await getTranslations("app/api/store/products");
    
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

    return null; // Return null if authentication is successful
}
