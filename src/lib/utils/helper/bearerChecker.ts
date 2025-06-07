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
