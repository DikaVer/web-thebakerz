import { stripe } from "@/stripe";
    import { NextRequest, NextResponse } from "next/server";
    import { getCurrentSession } from "@/lib/actions/session";
    import { globalPOSTRateLimit } from "@/lib/actions/requests";
    import { creatAccountAction } from "@/lib/actions/user";
    import { removeCartByUserIdAndStoreId } from "@/lib/actions/cart";
    import { connectionPool, containerOrders, containerOrdersUnpaid } from "@/db";
    import { OrderData, OrderProducts } from "@/lib/actions/order";
    import { sendOrderPlaced } from "@/lib/emailSendRequest";
    import { revalidateTag } from "next/cache";

    /**
     * Handles payment validation and order processing after a Stripe checkout session.
     */
    export async function GET(req: NextRequest) {
        // Check rate limiting
        if (!(await globalPOSTRateLimit())) {
            return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
        }

        const { searchParams } = new URL(req.url);
        const sessionId = searchParams.get('session_id');
        const storeIdParam = searchParams.get('store_id');
        const storeStripeAccountIdParam = searchParams.get('store_stripe_account_id');
        const origin = process.env.NEXT_PUBLIC_API_BASE_URL;

        // Validate required parameters
        if (!sessionId || !storeIdParam || !storeStripeAccountIdParam) {
            return NextResponse.redirect(new URL('/', origin));
        }

        try {
            // Begin transaction for database operations
            await connectionPool.query('BEGIN');

            // Verify payment status with Stripe
            const checkoutSession = await stripe.checkout.sessions.retrieve(sessionId);

            if (checkoutSession.payment_status !== 'paid') {
                // Payment wasn't successful
                await connectionPool.query('ROLLBACK');
                return NextResponse.redirect(new URL(`/${storeIdParam}/pay`, origin), { status: 308 });
            }

            // Extract necessary data from checkout session
            const email = checkoutSession.customer_email || checkoutSession.customer_details?.email;
            const storeId = checkoutSession.metadata?.storeId;
            const cosmosId = checkoutSession.metadata?.cosmosId;
            const cartId = checkoutSession.metadata?.userId;

            // Validate required checkout data
            if (!email || !storeId || !cosmosId || !cartId) {
                const missingParam = !email ? 'missing_user' :
                                  !storeId ? 'missing_store_id' :
                                  !cosmosId ? 'missing_cosmos_id' : 'missing_cart_id';
                await connectionPool.query('ROLLBACK');
                return NextResponse.redirect(new URL(`/${storeIdParam}/order/failed?error=${missingParam}&session_id=${sessionId}`, origin), { status: 308 });
            }

            // Handle user authentication
            let { user: userSession } = await getCurrentSession();
            let emailUser, emailVerified, username;

            if (!userSession) {
                // Create a new user account if not logged in
                userSession = await creatAccountAction(email, process.env.NEXT_PRIVATE_SECRET_BEARER!);
                emailUser = email;
                emailVerified = false;
                username = checkoutSession.customer_details?.name || 'Customer X';
            } else {
                emailUser = userSession.email;
                emailVerified = userSession.emailVerified;
                username = userSession.username;
            }

            if (!userSession) {
                await connectionPool.query('ROLLBACK');
                return NextResponse.redirect(new URL(`/${storeIdParam}/order/failed?error=missing_user&session_id=${sessionId}`, origin), { status: 308 });
            }

            // Retrieve temporary order from Cosmos DB
            const { resource: orderRaw } = await containerOrdersUnpaid.item(cosmosId, storeId).read();

            // Validate order data
            if (!orderRaw || !orderRaw.id) {
                await connectionPool.query('ROLLBACK');
                return NextResponse.redirect(new URL(`/${storeIdParam}/order/failed?error=order_not_found&session_id=${sessionId}`, origin), { status: 308 });
            }

            const dateParams = orderRaw.scheduled_time?.date;
            const timeParams = orderRaw.scheduled_time?.time;
            const cartItems: OrderProducts = orderRaw.productsData;

            if (!dateParams || !timeParams || !cartItems || cartItems.length === 0) {
                const errorType = !dateParams || !timeParams ? 'missing_order_time' : 'missing_cart';
                await connectionPool.query('ROLLBACK');
                return NextResponse.redirect(new URL(`/${storeIdParam}/order/failed?error=${errorType}&session_id=${sessionId}`, origin), { status: 308 });
            }

            // Create order in PostgreSQL
            const result = await connectionPool.query(
                `
                INSERT INTO payment_orders
                (store_id, store_order_id, email_customer, amount, product_ids, status, stripe_id, cosmos_id, email_verified)
                VALUES
                (
                    $1,
                    (SELECT COALESCE(COUNT(*) + 1, 1) FROM payment_orders WHERE store_id = $9),
                    $2,
                    $3,
                    $4::text[],
                    $5,
                    $6,
                    $7,
                    $8
                )
                RETURNING id, order_date, store_order_id
                `,
                [
                    storeId,
                    emailUser,
                    checkoutSession.amount_total,
                    cartItems?.map(item => item.id || 'Error'),
                    checkoutSession.payment_status,
                    sessionId,
                    cosmosId,
                    emailVerified,
                    storeId
                ]
            );

            if (result.rows.length === 0) {
                await connectionPool.query('ROLLBACK');
                return NextResponse.redirect(new URL(`/${storeIdParam}/order/failed?error=order_failed&session_id=${sessionId}`, origin), { status: 308 });
            }

            // Create order record in Cosmos DB
            const orderData: OrderData = {
                id: cosmosId,
                seq_id: result.rows[0].id,
                store_order_id: result.rows[0].store_order_id,
                store_id: storeId,
                customer_email: emailUser,
                customer: {
                    email_customer: emailUser,
                    email_verified: emailVerified,
                    name_customer: username,
                    phone_number: checkoutSession.customer_details?.phone,
                    address: checkoutSession.customer_details?.address || null,
                    payment_method: checkoutSession.payment_method_types,
                    payment_name: checkoutSession.customer_details?.name,
                    tax_id: checkoutSession.customer_details?.tax_ids?.[0]?.value,
                },
                createdAt: result.rows[0].order_date,
                amount: checkoutSession.amount_total || 0,
                status: checkoutSession.payment_status,
                scheduled_time: { date: dateParams, time: timeParams },
                order_status: 'new',
                completed: false,
                productsData: cartItems,
                sub_amount: checkoutSession.amount_subtotal || 0,
                tax_amount: checkoutSession.total_details?.amount_tax || 0,
            };

            // Store final order and clean up
            await containerOrders.items.create(orderData);
            await removeCartByUserIdAndStoreId(cartId, storeId);
            await containerOrdersUnpaid.item(cosmosId, storeId).delete();

            // Commit transaction
            await connectionPool.query('COMMIT');

            // Send confirmation email and invalidate cache
            sendOrderPlaced({
                orderData: orderData,
                identifier: email,
            });

            revalidateTag('orders');

            // Redirect to success page
            return NextResponse.redirect(new URL(`/${storeIdParam}/order/success`, origin), { status: 308 });
        } catch (error) {
            // Rollback transaction on error
            await connectionPool.query('ROLLBACK');
            console.error('Error processing payment:', error);
            return NextResponse.redirect(new URL(`/${storeIdParam}/order/failed?error=processing_error&session_id=${sessionId}`, origin), { status: 308 });
        }
    }