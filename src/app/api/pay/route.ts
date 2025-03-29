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
import { getTranslations } from "next-intl/server";
import { AddressFormType } from "@/components/providers/delivery-provider";

// Define an extended type for the raw order data we expect from unpaid container
interface ExtendedOrderRaw {
    id: string;
    store_id: string;
    createdAt: Date;
    customer_email?: string;
    scheduled_time: { date: string; time: string };
    productsData: OrderProducts;
    // Added fields from stripe.ts
    isDelivery?: boolean;
    deliveryAddress?: AddressFormType;
    deliveryRegionName?: string;
    deliveryFeeInclVat?: number;
    itemsSubtotalInclVat?: number;
    totalInclVat?: number;
    totalVat?: number;
    status?: string; 
}

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

        // --- Validate and Extract Data from orderRaw ---
        const dateParams = orderRaw.scheduled_time?.date;
        const timeParams = orderRaw.scheduled_time?.time;
        const cartItems: OrderProducts = orderRaw.productsData;
        const isDelivery = orderRaw.isDelivery ?? false;
        const deliveryAddress = orderRaw.deliveryAddress; // Keep as object
        const deliveryRegionName = orderRaw.deliveryRegionName;
        const deliveryFeeInclVat = orderRaw.deliveryFeeInclVat ?? 0;
        const itemsSubtotalInclVat = orderRaw.itemsSubtotalInclVat;
        const totalVat = orderRaw.totalVat;
        const totalInclVat = orderRaw.totalInclVat; // This is the final amount
        
        // Calculate total excluding VAT
        const totalExclVat = (totalInclVat !== undefined && totalVat !== undefined) 
            ? totalInclVat - totalVat 
            : checkoutSession.amount_subtotal ?? 0; // Fallback to Stripe's subtotal if ours is missing

        if (!dateParams || !timeParams || !cartItems || cartItems.length === 0 || itemsSubtotalInclVat === undefined || totalVat === undefined || totalInclVat === undefined) {
            const errorType = !dateParams || !timeParams ? t("missingOrderTime") 
                            : !cartItems || cartItems.length === 0 ? t("missingCart") 
                            : t("missingPricingDetails");
            await connectionPool.query('ROLLBACK');
            console.error("Missing critical data in unpaid order record:", { cosmosId, dateParams, timeParams, cartItems, itemsSubtotalInclVat, totalVat, totalInclVat });
            return NextResponse.redirect(new URL(`/${storeIdParam}/order/failed?error=${errorType}&session_id=${sessionId}`, origin), { status: 308 });
        }
        // --- End Data Validation ---

        // Create order in PostgreSQL - Updated Query
        const pgQuery = `
            INSERT INTO payment_orders (
                store_id, store_order_id, email_customer, total_incl_vat, product_ids, 
                status, stripe_id, cosmos_id, email_verified, is_delivery, 
                delivery_address, delivery_region_name, delivery_fee_incl_vat, 
                items_subtotal_incl_vat, total_vat, total_excl_vat 
            )
            VALUES (
                $1, 
                (SELECT COALESCE(MAX(store_order_id), 0) + 1 FROM payment_orders WHERE store_id = $16), 
                $2, $3, $4::text[], 
                $5, $6, $7, $8, $9, 
                $10, $11, $12, 
                $13, $14, $15
            )
            RETURNING id, order_date, store_order_id
        `;
        const pgValues = [
            storeId,                    // $1
            email,                      // $2 
            totalInclVat,               // $3 (amount - total incl VAT)
            cartItems.map(item => item.id || 'Error'), // $4 (product_ids)
            checkoutSession.payment_status, // $5 (status)
            sessionId,                  // $6 (stripe_id)
            cosmosId,                   // $7 (cosmos_id)
            emailVerified,              // $8 (email_verified)
            isDelivery,                 // $9 (is_delivery)
            isDelivery ? JSON.stringify(deliveryAddress) : null, // $10 (delivery_address - stringified JSON or NULL)
            deliveryRegionName,         // $11 (delivery_region_name)
            deliveryFeeInclVat,         // $12 (delivery_fee_incl_vat)
            itemsSubtotalInclVat,       // $13 (items_subtotal_incl_vat)
            totalVat,                   // $14 (total_vat)
            totalExclVat,                // $15 (sub_amount - total EXCL VAT)
            storeId           // $16 (added duplicate for the subquery)
        ];
        
        const result = await connectionPool.query(pgQuery, pgValues);

        if (result.rows.length === 0) {
            await connectionPool.query('ROLLBACK');
            console.error("Failed to insert order into PostgreSQL:", { cosmosId, storeId, email });
            return NextResponse.redirect(new URL(`/${storeIdParam}/order/failed?error=${t("orderDbFailed")}&session_id=${sessionId}`, origin), { status: 308 });
        }

        // Create final order record in Cosmos DB - Using updated OrderData fields
        const orderData: OrderData = {
            id: cosmosId,
            seq_id: result.rows[0].id,
            store_order_id: result.rows[0].store_order_id,
            store_id: storeId,
            customer_email: email, // Use the validated/primary email
            customer: {
                email_customer: email, // Use primary email
                email_verified: emailVerified,
                name_customer: username,
                phone_number: checkoutSession.customer_details?.phone, // From Stripe
                address: checkoutSession.customer_details?.address || null, // Stripe billing/shipping
                payment_method: checkoutSession.payment_method_types,
                payment_name: checkoutSession.customer_details?.name,
                tax_id: checkoutSession.customer_details?.tax_ids?.[0]?.value,
            },
            createdAt: result.rows[0].order_date,
            status: checkoutSession.payment_status as "paid" | "manual", // Should be 'paid' here
            scheduled_time: { date: dateParams, time: timeParams },
            order_status: 'new', // Initial status
            completed: false,
            productsData: cartItems,
            
            // Use values from orderRaw/calculated
            itemsSubtotalInclVat: itemsSubtotalInclVat, 
            deliveryFeeInclVat: deliveryFeeInclVat,
            sub_amount: totalExclVat,           // Total EXCL VAT
            tax_amount: totalVat,               // Total VAT
            amount: totalInclVat,               // Final total INCL VAT

            isDelivery: isDelivery,
            deliveryAddress: deliveryAddress, // Store the object
            deliveryRegionName: deliveryRegionName,
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