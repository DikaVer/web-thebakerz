import { NextResponse } from 'next/server';
import { getOrder } from "@/lib/actions/order";
import { getTranslations } from "next-intl/server";
import { globalGETRateLimit } from '@/lib/utils/helper/requests';
import { checkBearerToken } from '@/lib/utils/helper/bearerChecker';
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
export async function GET(request: Request, {params}: {params: Promise<{storeId: string, orderId: string, email: string}>}) {
    const t = await getTranslations("app/api/store/order");

    if (!(await globalGETRateLimit())) {
        return NextResponse.json(
            { error: "Too many requests" },
            { status: 429 }
        );
    }

    const {storeId, orderId, email} = await params;

    // Check bearer token authentication
    const authError = await checkBearerToken(request);
    if (authError) {
        return authError;
    }


    try {
        // Get order data
        //@ts-ignore
        const orderData = await getOrder(storeId, orderId, email);
        return NextResponse.json(orderData, { status: 200 });
    } catch (error) {
        console.error('Error retrieving order data:', error);
        return NextResponse.json(
            { error: t("internalError") },
            { status: 500 }
        );
    }
}