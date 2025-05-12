import { stripe } from "@/stripe";
import { NextRequest, NextResponse } from "next/server";
import { getCurrentSession } from "@/lib/actions/session";
import { globalPOSTRateLimit } from "@/lib/actions/requests";
import { creatAccountAction } from "@/lib/actions/user";
import { removeCartByUserIdAndStoreId } from "@/lib/actions/cart";
import { connectionPool, containerOrders, containerOrdersUnpaid, containerTransfers } from "@/db";
import {ExtendedOrderRaw, OrderData} from "@/lib/actions/order";
import { sendOrderPlaced } from "@/lib/emailSendRequest";
import { revalidateTag } from "next/cache";
import { getTranslations } from "next-intl/server";
import { logger } from "@/lib/logger";
import { getRequestContext } from "@/lib/request-context";

// Initialize logger for payment processing
const log = logger.child({ module: "payment-processing" });

/**
 * Handles payment validation and order processing after a Stripe checkout session.
 */
export async function GET(req: NextRequest) {
    const t = await getTranslations("app/api/pay");
    const context = await getRequestContext();
    
    log.info('paymentCallback', 'Payment callback received', {
        requestId: context.requestId,
        clientIP: context.clientIP,
        url: req.url
    });

    // Check rate limiting
    if (!(await globalPOSTRateLimit())) {
        log.warn('paymentCallback', 'Rate limit exceeded for payment callback', {
            requestId: context.requestId,
            clientIP: context.clientIP
        });
        return NextResponse.json({ error: t("tooManyRequests") }, { status: 429 });
    }

    const { searchParams } = new URL(req.url);
    const sessionId = searchParams.get('session_id');
    const storeIdParam = searchParams.get('store_id');
    const storeStripeAccountIdParam = searchParams.get('store_stripe_account_id');
    const origin = process.env.NEXT_PUBLIC_API_BASE_URL;

    log.debug('paymentCallback', 'Extracted parameters from request', {
        requestId: context.requestId,
        hasSessionId: !!sessionId,
        hasStoreId: !!storeIdParam,
        hasStoreStripeAccountId: !!storeStripeAccountIdParam
    });

    // Validate required parameters
    if (!sessionId || !storeIdParam || !storeStripeAccountIdParam) {
        log.warn('paymentCallback', 'Missing required parameters', {
            requestId: context.requestId,
            clientIP: context.clientIP,
            hasSessionId: !!sessionId,
            hasStoreId: !!storeIdParam,
            hasStoreStripeAccountId: !!storeStripeAccountIdParam
        });
        // Maybe redirect to a generic error page or home?
        return NextResponse.redirect(new URL('/', origin)); // Redirect home for safety
    }

    try {
        log.info('paymentCallback', 'Retrieving checkout session from Stripe', {
            requestId: context.requestId,
            sessionId
        });
        
        // Verify payment status with Stripe
        const checkoutSession = await stripe.checkout.sessions.retrieve(sessionId);

        if (checkoutSession.payment_status !== 'paid') {
            log.warn('paymentCallback', 'Payment not successful', {
                requestId: context.requestId,
                sessionId,
                paymentStatus: checkoutSession.payment_status
            });
            // Payment wasn't successful, redirect back to payment page
            return NextResponse.redirect(new URL(`/${storeIdParam}/pay?status=failed`, origin), { status: 308 });
        }

        log.info('paymentCallback', 'Payment successful', {
            requestId: context.requestId,
            sessionId,
            paymentStatus: checkoutSession.payment_status
        });

        // Extract necessary data from checkout session metadata FIRST
        const storeId = checkoutSession.metadata?.storeId;
        const cosmosId = checkoutSession.metadata?.cosmosOrderId; // Updated key from stripe.ts
        const cartId = checkoutSession.metadata?.userId;

        log.debug('paymentCallback', 'Extracted metadata from checkout session', {
            requestId: context.requestId,
            hasStoreId: !!storeId,
            hasCosmosId: !!cosmosId,
            hasCartId: !!cartId
        });

        // Validate required checkout metadata
        if (!storeId || !cosmosId || !cartId) {
            const missingParam = !storeId ? t("missingStoreId") :
                              !cosmosId ? t("missingCosmosId") :
                              t("missingCartId"); // or userId
            
            log.error('paymentCallback', 'Missing critical metadata from Stripe session', {
                requestId: context.requestId,
                missingParam,
                hasStoreId: !!storeId,
                hasCosmosId: !!cosmosId,
                hasCartId: !!cartId,
                sessionId
            });
            
            return NextResponse.redirect(new URL(`/${storeIdParam}/order/failed?error=${missingParam}&session_id=${sessionId}`, origin), { status: 308 });
        }
        
        log.info('paymentCallback', 'Retrieving temporary order from database', {
            requestId: context.requestId,
            storeId,
            cosmosId
        });
        
        // Now retrieve temporary order from Cosmos DB using validated metadata
        // Use the correct partition key (storeId)
        const { resource: orderRaw } = await containerOrdersUnpaid.item(cosmosId, storeId).read<ExtendedOrderRaw>();

        // Validate raw order data
        if (!orderRaw || !orderRaw.id) {
            log.error('paymentCallback', 'Unpaid order record not found in database', {
                requestId: context.requestId,
                cosmosId,
                storeId,
                orderExists: !!orderRaw
            });
            
            return NextResponse.redirect(new URL(`/${storeIdParam}/order/failed?error=${t("orderNotFound")}&session_id=${sessionId}`, origin), { status: 308 });
        }

        log.info('paymentCallback', 'Found temporary order, beginning transaction', {
            requestId: context.requestId,
            orderId: orderRaw.id,
            storeId
        });

        // Begin transaction for database operations *after* verifying payment and finding unpaid order
        await connectionPool.query('BEGIN');
        
        // Extract remaining data
        const email = checkoutSession.customer_email?.toLowerCase() || checkoutSession.customer_details?.email?.toLowerCase();
        if (!email) {
            // Email is crucial, fail if missing
            await connectionPool.query('ROLLBACK');
            
            log.error('paymentCallback', 'Missing customer email in Stripe session', {
                requestId: context.requestId,
                sessionId
            });
            
            return NextResponse.redirect(new URL(`/${storeIdParam}/order/failed?error=${t("missingUserEmail")}&session_id=${sessionId}`, origin), { status: 308 });
        }

        log.info('paymentCallback', 'Processing user session', {
            requestId: context.requestId,
            email: email,
            sessionId
        });

        // Handle user authentication/creation (as before)
        let { user: userSession } = await getCurrentSession();
        let emailVerified, username;
        if (!userSession || userSession.email?.toLowerCase() !== email) {
            log.info('paymentCallback', 'Creating/updating user account', {
                requestId: context.requestId,
                email: email,
                hasExistingUser: !!userSession,
                emailMismatch: userSession ? userSession.email?.toLowerCase() !== email : false
            });
            
            // If no session or email mismatch, create/update account
            // Consider potential security implications if a logged-in user pays with a different email
            userSession = await creatAccountAction(email, process.env.NEXT_PRIVATE_SECRET_BEARER!); // This might update an existing user based on email
            emailVerified = false; // New/updated account via payment isn't verified by default
            username = checkoutSession.customer_details?.name || email.split('@')[0]; // Use name or derive from email
        } else {
            log.info('paymentCallback', 'Using existing user session', {
                requestId: context.requestId,
                email: email,
                userId: userSession.id
            });
            
            emailVerified = userSession.emailVerified;
            username = userSession.username; // Use existing username
        }

        if (!userSession) {
            // Should not happen if creatAccountAction works, but check defensively
            await connectionPool.query('ROLLBACK');
            
            log.error('paymentCallback', 'Failed to get or create user session after payment', {
                requestId: context.requestId,
                email,
                sessionId
            });
            
            return NextResponse.redirect(new URL(`/${storeIdParam}/order/failed?error=${t("userCreationFailed")}&session_id=${sessionId}`, origin), { status: 308 });
        }

        log.debug('paymentCallback', 'Creating delivery order record', {
            requestId: context.requestId,
            storeId,
            orderId: cosmosId,
            isStoreDelivery: orderRaw.isStoreDelivery || false
        });

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
            orderRaw.isStoreDelivery || false
        ];

        const deliveryResult = await connectionPool.query(deliveryQuery, deliveryValues);
        const deliveryId = deliveryResult.rows[0].id;

        log.debug('paymentCallback', 'Creating price order record', {
            requestId: context.requestId,
            orderId: cosmosId,
            hasTransferData: !!orderRaw.transfer_data && orderRaw.transfer_data.length > 0
        });

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
            log.debug('paymentCallback', 'Creating transfer record', {
                requestId: context.requestId,
                transferId: cosmosId,
                storeId,
                destination: transfer.destination
            });
            
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

        log.debug('paymentCallback', 'Creating main order record', {
            requestId: context.requestId,
            orderId: cosmosId,
            storeId,
            email: email,
            emailVerified,
            deliveryId,
            priceId,
            productCount: orderRaw.productsData?.length || 0
        });

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
            RETURNING id, created_at, store_order_id
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
            
            log.error('paymentCallback', 'Failed to insert order into PostgreSQL', {
                requestId: context.requestId,
                cosmosId,
                storeId,
                email: email
            });
            
            return NextResponse.redirect(new URL(`/${storeIdParam}/order/failed?error=${t("orderDbFailed")}&session_id=${sessionId}`, origin), { status: 308 });
        }

        log.info('paymentCallback', 'Creating final order record in Cosmos DB', {
            requestId: context.requestId,
            orderId: cosmosId,
            storeId,
            storeOrderId: result.rows[0].store_order_id,
            seqId: result.rows[0].id,
            email: email
        });

        // Create final order record in Cosmos DB
        const orderData: OrderData = {
            id: cosmosId,
            seq_id: result.rows[0].id,
            store_order_id: result.rows[0].store_order_id,
            store_id: storeId,
            store_name: orderRaw.store_name,
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
            orderNote: orderRaw.orderNote,
            
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
            isStoreDelivery: orderRaw.isStoreDelivery,
            isPostDelivery: orderRaw.isPostDelivery,
            isCountryDelivery: orderRaw.isCountryDelivery,
            deliveryAddress: orderRaw.deliveryToAddress 
        };

        log.debug('paymentCallback', 'Storing final order and cleaning up', {
            requestId: context.requestId,
            orderId: cosmosId,
            storeId,
            cartId
        });

        // Store final order and clean up
        await containerOrders.items.create(orderData);
        await removeCartByUserIdAndStoreId(cartId, storeId, orderRaw.isDelivery ? "delivery" : "pickup");
        await containerOrdersUnpaid.item(cosmosId, storeId).delete();

        // Commit transaction
        await connectionPool.query('COMMIT');

        log.info('paymentCallback', 'Transaction committed successfully, sending confirmation email', {
            requestId: context.requestId,
            orderId: cosmosId,
            storeId,
            email: email
        });

        // Send confirmation email and invalidate cache
        sendOrderPlaced({
            orderData: orderData,
            identifier: email, // Use primary email for notification
        });

        revalidateTag('cart');
        revalidateTag('orders');

        log.info('paymentCallback', 'Order processing completed successfully', {
            requestId: context.requestId,
            orderId: cosmosId,
            storeId,
            storeOrderId: orderData.store_order_id,
            email: email
        });

        // Redirect to success page
        return NextResponse.redirect(new URL(`/${storeIdParam}/order/success?order_id=${cosmosId}`, origin), { status: 308 });

    } catch (error: any) {
        // Rollback transaction on any error during the process
        // Check if the connection pool has an active transaction before rolling back
        // (This might need a more robust check depending on your pg library) 
        try {
            await connectionPool.query('ROLLBACK');
            log.info('paymentCallback', 'Transaction rolled back due to error', {
                requestId: context.requestId
            });
        } catch (rollbackError) {
            log.error('paymentCallback', 'Error attempting to rollback transaction', {
                requestId: context.requestId,
                error: rollbackError instanceof Error ? rollbackError.message : String(rollbackError)
            });
        }
        
        log.error('paymentCallback', 'Error processing payment callback', {
            requestId: context.requestId,
            sessionId: searchParams?.get('session_id'),
            storeId: searchParams?.get('store_id'),
            error: error.message || 'Unknown error',
            stack: error.stack
        });
        
        // Provide a generic error message, log the specific details
        const errorQueryParam = encodeURIComponent(error.message || t("processingError"));
        return NextResponse.redirect(new URL(`/${storeIdParam}/order/failed?error=${errorQueryParam}&session_id=${sessionId}`, origin), { status: 308 });
    }
}