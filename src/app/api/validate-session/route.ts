/**
 * @fileoverview API route handling GET /api/validate-session, which validates a session token.
 *
 * Accepts GET requests with the session token passed as a Bearer token in the Authorization
 * header, validates it via validateSessionToken, and returns the validation result (session
 * and user data) as JSON. Rate limited via globalGETRateLimit.
 */
import { NextResponse } from 'next/server';
import { validateSessionToken } from '@/lib/actions/session';
import { getTranslations } from "next-intl/server";
import { globalGETRateLimit } from '@/lib/utils/helper/requests';
export async function GET(request: Request) {
    const t = await getTranslations("app/api/validate-session");

    if (!(await globalGETRateLimit())) {
        return NextResponse.json(
            { error: "Too many requests" },
            { status: 429 }
        );
    }
    
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
