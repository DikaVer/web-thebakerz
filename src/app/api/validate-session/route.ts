// app/api/validate-session/route.ts
import { NextResponse } from 'next/server';
import { validateSessionToken } from '@/lib/actions/session';
import { getTranslations } from "next-intl/server";

// This API route accepts GET requests with a Bearer token in the Authorization header.
export async function GET(request: Request) {
    const t = await getTranslations("app/api/validate-session");
    
    // Retrieve the Authorization header
    const authHeader = request.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return NextResponse.json(
            { error: t('missingAuth') },
            { status: 401 }
        );
    }

    // Extract the token from the Bearer string
    const token = authHeader.replace('Bearer ', '').trim();
    if (!token) {
        return NextResponse.json(
            { error: t('tokenNotProvided') },
            { status: 401 }
        );
    }

    try {
        // Call your validation logic with the extracted token
        const sessionValidationResult = await validateSessionToken(token);
        return NextResponse.json(sessionValidationResult, { status: 200 });
    } catch (error) {
        console.error('Error validating session:', error);
        return NextResponse.json({ 
            error: t("internalError") 
        }, { 
            status: 500 
        });
    }
}
