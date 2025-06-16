import { stripe } from "@/stripe";
import { NextRequest, NextResponse } from "next/server";
import { getCurrentSession, getSessionCookie } from "@/lib/actions/session";
import { globalPOSTRateLimit } from "@/lib/utils/helper/requests";
import { creatAccountAction } from "@/lib/actions/user";
import { removeCartByUserIdAndStoreId } from "@/lib/actions/cart";
import { connectionPool, containerOrders, containerOrdersUnpaid, containerTransfers } from "@/db";
import { ExtendedOrderRaw, OrderData } from "@/lib/actions/order";
import { sendOrderPlaced } from "@/lib/email-send-request";
import { revalidateTag } from "next/cache";
import { getTranslations } from "next-intl/server";
import { logger } from "@/lib/logger";
import { getRequestContext } from "@/lib/request-context";
import { checkAndReserveInventory } from "@/lib/utils/helper/check-inventory-rescue";
import { attachPaymentIntentToHold, removeHold } from "@/lib/utils/helper/inventory-holds";
import { cancelRescueDealCheckout } from "@/lib/utils/helper/inventory-integration";
import { scheduledToCalendarDateTime } from "@/lib/utils";
import { getLocalTimeZone } from "@internationalized/date";
import { now } from "@internationalized/date";

// Initialize logger for payment processing
const log = logger.child({ module: "payment-intent-processing" });

/**
 * Handles payment intent confirmation and order processing.
 */
export async function POST(req: NextRequest) {
    const t = await getTranslations("app/api/pay");
    const context = await getRequestContext();
    
    log.info('paymentIntentConfirm', 'Payment intent confirmation received', {
        requestId: context.requestId,
        clientIP: context.clientIP,
        url: req.url
    });

    if (!(await globalPOSTRateLimit())) {
        log.warn('paymentIntentConfirm', 'Rate limit exceeded for payment intent confirmation', {
            requestId: context.requestId,
            clientIP: context.clientIP
        });
        return NextResponse.json({ error: t("tooManyRequests") }, { status: 429 });
    }

    try {
        const body = await req.json();
        const { confirmationTokenId, orderId, storeId, email: providedEmail, name: providedName, isRescueDeal } = body;

        if (!confirmationTokenId || !orderId) {
            log.warn('paymentIntentConfirm', 'Missing confirmationTokenId or orderId', {
                requestId: context.requestId,
                clientIP: context.clientIP
            });
            return NextResponse.json({ error: 'Confirmation Token ID and Order ID are required' }, { status: 400 });
        }

        // Retrieve temporary order from Cosmos DB
        const { resource: orderRaw } = await containerOrdersUnpaid.item(orderId, storeId).read<ExtendedOrderRaw>();

        if (!orderRaw || !orderRaw.id) {
            log.error('paymentIntentConfirm', 'Unpaid order record not found in database', {
                requestId: context.requestId,
                cosmosId: orderId,
                orderExists: !!orderRaw
            });
            return NextResponse.json({ error: t("orderNotFound") }, { status: 404 });
        }

        //Check if scheduled time is not in the past
        if(orderRaw.isRescueDeal){
            const scheduledTime = scheduledToCalendarDateTime(orderRaw.scheduled_time);
            const nowTime = now("Europe/Amsterdam");   
            if(scheduledTime.compare(nowTime) <= 0){
                return NextResponse.json({ error: t("rescueDealNotAvailableScheduledTime") }, { status: 400 });
            }
        }

        log.info('paymentIntentConfirm', 'Creating and confirming payment intent', {
            requestId: context.requestId,
            orderId,
            storeId
        });

        // Handle user authentication/creation to get userId for metadata
        let { user: userSession } = await getCurrentSession();
        let userId = userSession?.id || await getSessionCookie();

        if (!userId) {
            log.error('paymentIntentConfirm', 'Missing user ID', {
                requestId: context.requestId,
                orderId,
                storeId
            });
            return NextResponse.json({ error: t("userCreationFailed") }, { status: 500 });
        }

        let holdIds: Record<string, string> | undefined = undefined;

        if(isRescueDeal){
            const productsIds = orderRaw.productsData?.map(p => p.id) || [];
            const quantities = orderRaw.productsData?.reduce((acc, p) => {
                acc[p.id] = p.qty;
                return acc;
            }, {} as Record<string, number>) || {};
            const checkResult = await checkAndReserveInventory(productsIds, storeId, quantities, userId);
            if(!checkResult.isAvailable){
                return NextResponse.json({ error: t("rescueDealNotAvailable") }, { status: 400 });
            }
            holdIds = checkResult.holdIds;
            logger.info('paymentIntentConfirm', 'Rescue deal hold ids', {
                requestId: context.requestId,
                orderId,
                storeId,
                holdIds
            });
        }

        // Create and confirm the PaymentIntent in one step
        const paymentIntent = await stripe.paymentIntents.create({
            amount: orderRaw.totalInclVat,
            currency: orderRaw.currency.toLowerCase(),
            automatic_payment_methods: { enabled: true },
            confirmation_token: confirmationTokenId,
            confirm: true,
            metadata: {
                storeId: storeId,
                cosmosOrderId: orderId,
                userId: userId,
                storeName: orderRaw.store_name || storeId,
                isDelivery: orderRaw.isDelivery ? 'true' : 'false',
                isRescueDeal: isRescueDeal ? 'true' : 'false',
            }
        });

        if(isRescueDeal && holdIds){
            for(const holdId of Object.values(holdIds || {})){
                await attachPaymentIntentToHold(holdId, storeId, paymentIntent.id);
            }
            logger.info('paymentIntentConfirm', 'Rescue deal payment intent attached', {
                requestId: context.requestId,
                orderId,
                storeId,
                holdIds
            });
        }
        
        if (paymentIntent.status !== 'succeeded' && paymentIntent.status !== 'requires_action') {
             log.error('paymentIntentConfirm', 'Payment intent confirmation failed', {
                requestId: context.requestId,
                orderId,
                status: paymentIntent.status
            });
            if(isRescueDeal){
                await cancelRescueDealCheckout(storeId, holdIds || {});
            }
            return NextResponse.json({ 
                error: `Payment failed with status: ${paymentIntent.status}`,
                status: paymentIntent.status,
            }, { status: 400 });
        }

        if (paymentIntent.status === 'requires_action') {
            log.info('paymentIntentConfirm', 'Payment requires action', {
                requestId: context.requestId,
                orderId,
                status: paymentIntent.status
            });
            return NextResponse.json({
                status: paymentIntent.status,
                client_secret: paymentIntent.client_secret,
            });
        }
        
        // At this point, payment has succeeded.
        log.info('paymentIntentConfirm', 'Payment successful, proceeding to create order', {
            requestId: context.requestId,
            orderId,
            paymentIntentId: paymentIntent.id
        });

        // Begin transaction for database operations
        await connectionPool.query('BEGIN');
        
        const email = providedEmail?.toLowerCase()
        const customerName = providedName

        if (!email) {
            await connectionPool.query('ROLLBACK');
            
            log.error('paymentIntentConfirm', 'Missing customer email in request body', {
                requestId: context.requestId,
                paymentIntentId: paymentIntent.id
            });
            
            return NextResponse.json({ error: t("missingUserEmail") }, { status: 400 });
        }

        // Use the userSession we already have from metadata creation
        let emailVerified, username;
        if (!userSession || userSession.email?.toLowerCase() !== email) {
            // If we need to create/update the user session, do it here
            if (!userSession) {
                userSession = await creatAccountAction(email, process.env.NEXT_PRIVATE_SECRET_BEARER!);
            }
            emailVerified = false;
            username = customerName || email.split('@')[0];
        } else {
            emailVerified = userSession.emailVerified;
            username = userSession.username;
        }

        if (!userSession) {
            await connectionPool.query('ROLLBACK');
            return NextResponse.json({ error: t("userCreationFailed") }, { status: 500 });
        }
        
        const cartId = userSession.id

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
                transfer_id: orderId,
                store_id: storeId,
                destination: transfer.destination,
                amount: transfer.amount,
                app_fee: transfer.app_fee,
                created_at: new Date()
            };

            await containerTransfers.items.create(transferData);
        }

        const priceValues = [
            null, // promotion_id
            null, // referral_id
            orderId, // Use orderId as transfer_id
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
            'paid', // Payment intent status is 'succeeded'
            orderRaw.currency
        ];

        const result = await connectionPool.query(orderQuery, orderValues);

        if (result.rows.length === 0) {
            await connectionPool.query('ROLLBACK');
            return NextResponse.json({ error: t("orderDbFailed") }, { status: 500 });
        }

        // Create final order record in Cosmos DB
        const orderData: OrderData = {
            id: orderId,
            seq_id: result.rows[0].id,
            store_order_id: result.rows[0].store_order_id,
            store_id: storeId,
            store_name: orderRaw.store_name,
            customer_email: email,
            customer: {
                email_customer: email,
                email_verified: emailVerified,
                name_customer: username,
                phone_number: null,
                address: null,
                payment_method: paymentIntent.payment_method_types[0] || null,
                payment_intent: paymentIntent.id,
                payment_name: customerName,
                tax_id: null,
            },
            createdAt: result.rows[0].created_at,
            status: "paid",
            scheduled_time: orderRaw.scheduled_time,
            order_status: 'new',
            completed: false,
            productsData: orderRaw.productsData || [],
            orderNote: orderRaw.orderNote,
            
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

            isRescueDeal: orderRaw.isRescueDeal,

            isDelivery: orderRaw.isDelivery,
            isStoreDelivery: orderRaw.isStoreDelivery,
            isPostDelivery: orderRaw.isPostDelivery,
            isCountryDelivery: orderRaw.isCountryDelivery,
            deliveryAddress: orderRaw.deliveryToAddress 
        };

        // Store final order and clean up
        await containerOrders.items.create(orderData);
        await removeCartByUserIdAndStoreId(cartId, storeId, orderRaw.isDelivery ? "delivery" : "pickup");
        await containerOrdersUnpaid.item(orderId, storeId).delete();
        if(isRescueDeal && holdIds){
            await cancelRescueDealCheckout(storeId, holdIds);
        }

        // Commit transaction
        await connectionPool.query('COMMIT');

        // Send confirmation email and invalidate cache
        sendOrderPlaced({
            orderData: orderData,
            identifier: email,
        });

        revalidateTag('cart');
        revalidateTag('orders');

        log.info('paymentIntentConfirm', 'Order processing completed successfully', {
            requestId: context.requestId,
            orderId: orderId,
            storeId,
            storeOrderId: orderData.store_order_id,
            email: email
        });

        // Return success response to the client
        return NextResponse.json({ 
            status: paymentIntent.status,
            orderId: orderId,
            storeOrderId: orderData.store_order_id
        });

    } catch (error: any) {
        try {
            await connectionPool.query('ROLLBACK');
        } catch (rollbackError) {
            log.error('paymentIntentConfirm', 'Error attempting to rollback transaction', {
                requestId: context.requestId,
                error: rollbackError instanceof Error ? rollbackError.message : String(rollbackError)
            });
        }
        
        log.error('paymentIntentConfirm', 'Error processing payment intent confirmation', {
            requestId: context.requestId,
            error: error.message || 'Unknown error',
            stack: error.stack
        });
        
        return NextResponse.json({ 
            error: { message: error.message || t("processingError") }
        }, { status: 500 });
    }
} 