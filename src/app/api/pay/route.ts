import { stripe } from "@/stripe";
import { NextRequest, NextResponse } from "next/server";
import { getCurrentSession } from "@/lib/actions/session";
import { globalPOSTRateLimit } from "@/lib/actions/requests";
import {creatAccountAction} from "@/lib/actions/user";
import {removeCartByUserIdAndStoreId} from "@/lib/actions/cart";
import {connectionPool, containerOrders} from "@/db";
import {OrderData, OrderProduct} from "@/lib/actions/order";
import {sendOrderPlaced} from "@/lib/emailSendRequest";
import {revalidateTag} from "next/cache";
import {v4 as uuidv4} from "uuid";

export async function GET(req: NextRequest) {
    // Rate limiting check
    if (!(await globalPOSTRateLimit())) {
        return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
    }


    const { searchParams } = new URL(req.url);
    const sessionId = searchParams.get('session_id');
    const origin = process.env.NEXT_PUBLIC_API_BASE_URL;

    if (!sessionId) {
        return NextResponse.redirect(new URL('/', origin));
    }

    const storeIdParam = searchParams.get('store_id');

    if (!storeIdParam) {
        return NextResponse.redirect(new URL('/', origin));
    }

    const storeStripeAccountIdParam = searchParams.get('store_stripe_account_id');

    if (!storeStripeAccountIdParam) {
        return NextResponse.redirect(new URL('/', origin));
    }

    try {
        // Retrieve the session to check its status
        const checkoutSession = await stripe.checkout.sessions.retrieve(sessionId, { stripeAccount: 'acct_1R08EX4aNmXJ3PYr' });

        // Verify payment status
        if (checkoutSession.payment_status === 'paid') {

            // Get current user
            const email = checkoutSession.customer_email ? checkoutSession.customer_email : checkoutSession.customer_details?.email;
            if (!email) {
                return NextResponse.redirect(new URL(`/${storeIdParam}/order/failed?error=missing_user&session_id=${sessionId}`, origin));
            }

            const storeId = checkoutSession.metadata?.storeId;
            if (!storeId) {
                return NextResponse.redirect(new URL(`/${storeIdParam}/order/failed?error=missing_store_id&session_id=${sessionId}`, origin));
            }

            // Get current session
            let { user: userSession } = await getCurrentSession();
            if (!userSession) {
                userSession = await creatAccountAction(email, process.env.NEXT_PRIVATE_SECRET_BEARER!);
            }

            if (!userSession) {
                return NextResponse.redirect(new URL(`/${storeIdParam}/order/failed?error=missing_user&session_id=${sessionId}`, origin));
            }

            const cartId = checkoutSession.metadata?.userId;
            if (!cartId) {
                return NextResponse.redirect(new URL(`/${storeIdParam}/order/failed?error=missing_cart_id&session_id=${sessionId}`, origin));
            }

            const dateParams = checkoutSession.metadata?.orderDate;
            const timeParams = checkoutSession.metadata?.orderTime;
            if (!dateParams || !timeParams) {
                return NextResponse.redirect(new URL(`/${storeIdParam}/order/failed?error=missing_order_time&session_id=${sessionId}`, origin));
            }
            const cartItems: OrderProduct = JSON.parse(checkoutSession.metadata?.cartItems || '');
            if (!cartItems || cartItems.length === 0) {
                return NextResponse.redirect(new URL(`/${storeIdParam}/order/failed?error=missing_cart&session_id=${sessionId}`, origin));
            }

            const cosmosId = uuidv4();

            // Create order in your system
            // 1. Create an order record in PostgreSQL
            const result = await connectionPool.query(
                `
                    INSERT INTO payment_orders
                    (store_id, store_order_id, email_customer, amount, product_ids, status, stripe_id, cosmos_id)
                    VALUES
                        (
                            $1,
                            (SELECT COALESCE(COUNT(*) + 1, 1) FROM payment_orders WHERE store_id = $8),
                            $2,
                            $3,
                            $4::text[],
                            $5,
                            $6,
                            $7
                        )
                        RETURNING order_date, store_order_id
                `,
                [
                    storeId,
                    email,
                    checkoutSession.amount_total,
                    cartItems?.map(item => item.id || 'Error'), // Pass as native array for text[] column
                    checkoutSession.payment_status,
                    sessionId,
                    cosmosId,
                    storeId  // Added storeId again as parameter $7 for the subquery
                ]
            );


            if (result.rows.length === 0) {
                return NextResponse.redirect(new URL(`/${storeIdParam}/order/failed?error=order_failed&session_id=${sessionId}`, origin));
            }

            // 2. Create an order record in Azure Cosmos DB
            const orderData: OrderData = {
                id: cosmosId,
                order_id: result.rows[0].store_order_id,
                store_id: storeId,
                email_customer: email,
                createdAt: result.rows[0].order_date,
                amount: checkoutSession.amount_total ? checkoutSession.amount_total : 0,
                status: checkoutSession.payment_status,
                scheduled_time: {
                    date: dateParams,
                    time: timeParams
                },
                order_status: 'new',
                completed:false,
                productsData: cartItems,
                amount_tax: checkoutSession.total_details?.amount_tax ? checkoutSession.total_details.amount_tax : 0,

            }

            await containerOrders.items.create(orderData);

            await removeCartByUserIdAndStoreId(cartId, storeId);

            // 3. Send confirmation email
            sendOrderPlaced({
                orderData: orderData,
                identifier: email,
            })

            revalidateTag('orders');


            // Redirect to success page
            return NextResponse.redirect(new URL(`/${storeIdParam}/order/success`, origin));
        } else {
            // Payment wasn't successful
            return NextResponse.redirect(new URL(`/${storeIdParam}/order/failed?error=payment_failed&session_id=${sessionId}`, origin));
        }
    } catch (error) {

        console.error('Error processing payment:', error);
        return NextResponse.redirect(new URL(`/${storeIdParam}/order/failed?error=processing_error&session_id=${sessionId}`, origin));

    }
}