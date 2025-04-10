import { stripe } from "@/stripe";
import { NextRequest, NextResponse } from "next/server";
import { getCurrentSession } from "@/lib/actions/session";
import { globalPOSTRateLimit } from "@/lib/actions/requests";
import { creatAccountAction } from "@/lib/actions/user";
import { removeCartByUserIdAndStoreId } from "@/lib/actions/cart";
import { connectionPool, containerOrders, containerOrdersUnpaid, containerTransfers } from "@/db";
import {ExtendedOrderRaw, OrderData, OrderProducts} from "@/lib/actions/order";
import { sendOrderPlaced } from "@/lib/emailSendRequest";
import { revalidateTag } from "next/cache";
import { getTranslations } from "next-intl/server";
import { AddressFormType } from "@/components/providers/delivery-provider";


/**
 * Handles payment validation and order processing after a Stripe checkout session.
 */
export async function GET(req: NextRequest) {
    const t = await getTranslations("app/api/pay");

    // Check rate limiting
    if (!(await globalPOSTRateLimit())) {
        return NextResponse.json({ error: t("tooManyRequests") }, { status: 429 });
    }

    const { searchParams } = new URL(req.url);
    const sessionId = searchParams.get('session_id');
    const storeIdParam = searchParams.get('store_id');
    const storeStripeAccountIdParam = searchParams.get('store_stripe_account_id');
    const origin = process.env.NEXT_PUBLIC_API_BASE_URL;

    // Validate required parameters
    if (!sessionId || !storeIdParam || !storeStripeAccountIdParam) {
        // Maybe redirect to a generic error page or home?
        console.warn("Missing session_id, store_id, or store_stripe_account_id in payment callback");
        return NextResponse.redirect(new URL('/', origin)); // Redirect home for safety
    }

    try {
        // Verify payment status with Stripe
        const checkoutSession = await stripe.checkout.sessions.retrieve(sessionId);

        if (checkoutSession.payment_status !== 'paid') {
            // Payment wasn't successful, redirect back to payment page
            return NextResponse.redirect(new URL(`/${storeIdParam}/pay?status=failed`, origin), { status: 308 });
        }

        // Extract necessary data from checkout session metadata FIRST
        const storeId = checkoutSession.metadata?.storeId;
        const cosmosId = checkoutSession.metadata?.cosmosOrderId; // Updated key from stripe.ts
        const cartId = checkoutSession.metadata?.userId;

        // Validate required checkout metadata
        if (!storeId || !cosmosId || !cartId) {
            const missingParam = !storeId ? t("missingStoreId") :
                              !cosmosId ? t("missingCosmosId") :
                              t("missingCartId"); // or userId
            console.error("Missing critical metadata from Stripe session:", { storeId, cosmosId, cartId, sessionId });
            return NextResponse.redirect(new URL(`/${storeIdParam}/order/failed?error=${missingParam}&session_id=${sessionId}`, origin), { status: 308 });
        }
        
        // Now retrieve temporary order from Cosmos DB using validated metadata
        // Use the correct partition key (storeId)
        const { resource: orderRaw } = await containerOrdersUnpaid.item(cosmosId, storeId).read<ExtendedOrderRaw>();

        // Validate raw order data
        if (!orderRaw || !orderRaw.id) {
            console.error("Unpaid order record not found in CosmosDB:", { cosmosId, storeId });
            return NextResponse.redirect(new URL(`/${storeIdParam}/order/failed?error=${t("orderNotFound")}&session_id=${sessionId}`, origin), { status: 308 });
        }

        // Begin transaction for database operations *after* verifying payment and finding unpaid order
        await connectionPool.query('BEGIN');
        
        // Extract remaining data
        const email = checkoutSession.customer_email || checkoutSession.customer_details?.email;
        if (!email) {
            // Email is crucial, fail if missing
             await connectionPool.query('ROLLBACK');
            console.error("Missing customer email in Stripe session:", sessionId);
            return NextResponse.redirect(new URL(`/${storeIdParam}/order/failed?error=${t("missingUserEmail")}&session_id=${sessionId}`, origin), { status: 308 });
        }

        // Handle user authentication/creation (as before)
        let { user: userSession } = await getCurrentSession();
        let emailVerified, username;
        if (!userSession || userSession.email?.toLowerCase() !== email.toLowerCase()) {
             // If no session or email mismatch, create/update account
            // Consider potential security implications if a logged-in user pays with a different email
            userSession = await creatAccountAction(email, process.env.NEXT_PRIVATE_SECRET_BEARER!); // This might update an existing user based on email
            emailVerified = false; // New/updated account via payment isn't verified by default
            username = checkoutSession.customer_details?.name || email.split('@')[0]; // Use name or derive from email
        } else {
            emailVerified = userSession.emailVerified;
            username = userSession.username; // Use existing username
        }

        if (!userSession) {
            // Should not happen if creatAccountAction works, but check defensively
            await connectionPool.query('ROLLBACK');
            console.error("Failed to get or create user session after payment:", { email, sessionId });
            return NextResponse.redirect(new URL(`/${storeIdParam}/order/failed?error=${t("userCreationFailed")}&session_id=${sessionId}`, origin), { status: 308 });
        }

        // Create delivery order record
        const deliveryQuery = `
            INSERT INTO delivery_orders (
                to_lng, to_lat, from_lng, from_lat, is_store_delivery
            )
            VALUES ($1, $2, $3, $4, $5)
            RETURNING id
        `;
        
        const deliveryValues = [
            orderRaw.deliveryToAddress?.coordinates?.lng || null,
            orderRaw.deliveryToAddress?.coordinates?.lat || null,
            orderRaw.deliveryFromAddress?.lng || null,
            orderRaw.deliveryFromAddress?.lat || null,
            orderRaw.isDelivery || false
        ];

        const deliveryResult = await connectionPool.query(deliveryQuery, deliveryValues);
        const deliveryId = deliveryResult.rows[0].id;

        // Create price order record
        const priceQuery = `
            INSERT INTO price_orders (
                promotion_id, referral_id, transfer_id,
                itemInclVat, itemExclVat,
                deliveryInclVat, deliveryExclVat,
                serviceInclVat, serviceExclVat,
                totalInclVat, totalExclVat
            )
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
            RETURNING id
        `;

        // Create transfer records in Cosmos DB
        for (const transfer of orderRaw.transfer_data) {
            const transferData = {
                transfer_id: cosmosId,
                store_id: storeId,
                destination: transfer.destination,
                amount: transfer.amount,
                app_fee: transfer.app_fee,
                created_at: new Date()
            };

            await containerTransfers.items.create(transferData);
        }

        const priceValues = [
            null, // promotion_id not available in ExtendedOrderRaw
            null, // referral_id not available in ExtendedOrderRaw
            cosmosId, // Use cosmosId as transfer_id
            orderRaw.itemInclVat,
            orderRaw.itemExclVat,  
            orderRaw.deliveryFeeInclVat,   
            orderRaw.deliveryFeeExclVat, 
            orderRaw.serviceFeeInclVat, 
            orderRaw.serviceFeeExclVat, 
            orderRaw.totalInclVat,     
            orderRaw.totalExclVat 
        ];

        const priceResult = await connectionPool.query(priceQuery, priceValues);
        const priceId = priceResult.rows[0].id;

        // Create main order record
        const orderQuery = `
            INSERT INTO orders (
                store_id, store_order_id, customer, email_verified,
                delivery_id, price_id, product_ids, region,
                status, currency
            )
            VALUES (
                $1, 
                get_next_store_order_id($1),
                $2, $3, $4, $5, $6, $7, $8, $9
            )
            RETURNING id, created_at
        `;

        const orderValues = [
            storeId,
            email,
            emailVerified,
            deliveryId,
            priceId,
            orderRaw.productsData?.map(p => p.id) || [],
            orderRaw.region,
            checkoutSession.payment_status,
            orderRaw.currency
        ];

        const result = await connectionPool.query(orderQuery, orderValues);

        if (result.rows.length === 0) {
            await connectionPool.query('ROLLBACK');
            console.error("Failed to insert order into PostgreSQL:", { cosmosId, storeId, email });
            return NextResponse.redirect(new URL(`/${storeIdParam}/order/failed?error=${t("orderDbFailed")}&session_id=${sessionId}`, origin), { status: 308 });
        }

        // Create final order record in Cosmos DB
        const orderData: OrderData = {
            id: cosmosId,
            seq_id: result.rows[0].id,
            store_order_id: result.rows[0].store_order_id,
            store_id: storeId,
            customer_email: email,
            customer: {
                email_customer: email,
                email_verified: emailVerified,
                name_customer: username,
                phone_number: checkoutSession.customer_details?.phone,
                address: checkoutSession.customer_details?.address || null,
                payment_method: checkoutSession.payment_method_types,
                payment_name: checkoutSession.customer_details?.name,
                tax_id: checkoutSession.customer_details?.tax_ids?.[0]?.value,
            },
            createdAt: result.rows[0].created_at,
            status: checkoutSession.payment_status as "paid" | "manual",
            scheduled_time: orderRaw.scheduled_time,
            order_status: 'new',
            completed: false,
            productsData: orderRaw.productsData || [],
            
            // Price information
            priceData: {
                itemInclVat: orderRaw.itemInclVat,
                itemExclVat: orderRaw.itemExclVat,
                deliveryFeeInclVat: orderRaw.deliveryFeeInclVat,
                deliveryFeeExclVat: orderRaw.deliveryFeeExclVat,
                serviceFeeInclVat: orderRaw.serviceFeeInclVat,
                serviceFeeExclVat: orderRaw.serviceFeeExclVat,
                itemVat: orderRaw.itemVat,
                deliveryVat: orderRaw.deliveryVat,
                serviceVat: orderRaw.serviceVat,
                totalInclVat: orderRaw.totalInclVat,
                totalExclVat: orderRaw.totalExclVat,
                totalVat: orderRaw.totalVat
            },

            // Delivery information
            isDelivery: orderRaw.isDelivery,
            deliveryAddress: orderRaw.deliveryToAddress
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
            identifier: email, // Use primary email for notification
        });

        revalidateTag('cart');
        revalidateTag('orders');

        // Redirect to success page
        return NextResponse.redirect(new URL(`/${storeIdParam}/order/success?order_id=${cosmosId}`, origin), { status: 308 });

    } catch (error: any) {
        // Rollback transaction on any error during the process
        // Check if the connection pool has an active transaction before rolling back
        // (This might need a more robust check depending on your pg library) 
        try {
             await connectionPool.query('ROLLBACK');
             console.info("Transaction rolled back due to error.");
        } catch (rollbackError) {
             console.error("Error attempting to rollback transaction:", rollbackError);
        }
        
        console.error('Error processing payment callback:', error);
        // Provide a generic error message, log the specific details
        const errorQueryParam = encodeURIComponent(error.message || t("processingError"));
        return NextResponse.redirect(new URL(`/${storeIdParam}/order/failed?error=${errorQueryParam}&session_id=${sessionId}`, origin), { status: 308 });
    }
}