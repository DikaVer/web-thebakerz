/**
 * @fileoverview API route handling GET /api/store/order/[storeId]/[orderId]/[email], which retrieves a single order.
 *
 * Looks up order details for the given store, order ID, and customer email via the getOrder
 * action and returns them as JSON. Requires bearer token authentication (Authorization
 * header) and is rate limited via globalGETRateLimit.
 */
import { NextResponse } from 'next/server';
import { getOrder } from "@/lib/actions/order";
import { getTranslations } from "next-intl/server";
import { globalGETRateLimit } from '@/lib/utils/helper/requests';
import { checkBearerToken } from '@/lib/utils/helper/bearerChecker';
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