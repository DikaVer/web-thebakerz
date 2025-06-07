import { NextResponse } from 'next/server';
import { getOrder } from "@/lib/actions/order";
import { getTranslations } from "next-intl/server";
import { globalGETRateLimit } from '@/lib/utils/helper/requests';
/**
 * API Route: GET Order Information
 *
 * Retrieves order details for a specific order in a store.
 * Requires authentication via bearer token.
 *
 * Required headers:
 * - Store-Id: Store ID
 * - Order-Id: Order ID
 * - Email: User email
 * - Authorization: Bearer token
 *
 * @route GET /api/store/order
 * @returns {Promise<NextResponse>} Order data or error response
 */
export async function GET(request: Request) {
    const t = await getTranslations("app/api/store/order");

    if (!(await globalGETRateLimit())) {
        return NextResponse.json(
            { error: "Too many requests" },
            { status: 429 }
        );
    }
    
    // Validate required headers
    const headers = {
        storeId: request.headers.get('Store-Id'),
        orderId: request.headers.get('Order-Id'),
        email: request.headers.get('Email'),
        auth: request.headers.get('Authorization')
    };

    // Check for missing headers
    for (const [key, value] of Object.entries(headers)) {
        if (!value) {
            const headerName = key === 'auth' ? 'Authorization' :
                key === 'email' ? 'User-Id' : `${key.charAt(0).toUpperCase() + key.slice(1)}-Id`;

            return NextResponse.json(
                { error: t(`missing${key.charAt(0).toUpperCase() + key.slice(1)}`) },
                { status: 401 }
            );
        }
    }

    // Validate bearer token
    //@ts-ignore
    const token = headers.auth.replace('Bearer ', '').trim();
    if (token !== process.env.NEXT_PRIVATE_SECRET_BEARER) {
        return NextResponse.json(
            { error: t("notAuthorized") },
            { status: 401 }
        );
    }

    try {
        // Get order data
        //@ts-ignore
        const orderData = await getOrder(headers.storeId, headers.orderId, headers.email);
        return NextResponse.json(orderData, { status: 200 });
    } catch (error) {
        console.error('Error retrieving order data:', error);
        return NextResponse.json(
            { error: t("internalError") },
            { status: 500 }
        );
    }
}