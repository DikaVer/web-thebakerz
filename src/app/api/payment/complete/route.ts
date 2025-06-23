import { stripe } from "@/stripe";
import { NextRequest, NextResponse } from "next/server";
import { getCurrentSession } from "@/lib/actions/session";
import { globalGETRateLimit } from "@/lib/utils/helper/requests";
import { creatAccountAction } from "@/lib/actions/user";
import { removeCartByUserIdAndStoreId } from "@/lib/actions/cart";
import { connectionPool, containerOrders, containerOrdersUnpaid, containerTransfers } from "@/db";
import { ExtendedOrderRaw, OrderData } from "@/lib/actions/order";
import { sendOrderPlaced } from "@/lib/email-send-request";
import { revalidateTag } from "next/cache";
import { logger } from "@/lib/logger";
import { getRequestContext } from "@/lib/request-context";
import { cancelRescueDealCheckout } from "@/lib/utils/helper/inventory-integration";
import { getActiveHoldsByUserIdAndStoreId } from "@/lib/utils/helper/inventory-holds";

const log = logger.child({ module: "payment-completion" });

/**
 * Handles payment completion redirect from iDEAL and other redirect-based payment methods.
 * This endpoint is called by Stripe after the user completes payment at their bank.
 */
export async function GET(req: NextRequest) {
    const context = await getRequestContext();
    const { searchParams } = new URL(req.url);
    const paymentIntentId = searchParams.get('payment_intent');
    const origin = process.env.NEXT_PUBLIC_API_BASE_URL || req.nextUrl.origin;
    let storeIdForErrorRedirect: string | undefined;
    
    log.info('paymentComplete', 'Payment completion redirect received', {
        requestId: context.requestId,
        clientIP: context.clientIP,
        url: req.url,
        origin: origin
    });

    // Helper to generate checkout error redirect
    const checkoutErrorRedirect = async (storeIdentifier: string | undefined, errorCode: string, params: Record<string, string> = {}, isRescueDeal?: boolean, cartId?: string, storeId?: string) => {
        const urlPath = storeIdentifier ? `/${storeIdentifier}/checkout` : `/payment/error`;
        const redirectUrl = new URL(urlPath, origin);
        redirectUrl.searchParams.set('error', errorCode);
        for (const key in params) {
            redirectUrl.searchParams.set(key, params[key]);
        }
        if(isRescueDeal && cartId && storeId){
            const holds = await getActiveHoldsByUserIdAndStoreId(cartId, storeId);
            await cancelRescueDealCheckout(storeId, holds);
        }

        return NextResponse.redirect(redirectUrl, { status: 308 });
    };

    if (!(await globalGETRateLimit())) {
        log.warn('paymentComplete', 'Rate limit exceeded for payment completion', {
            requestId: context.requestId,
            clientIP: context.clientIP
        });
        return checkoutErrorRedirect(undefined, 'rate_limit');
    }

    if (!paymentIntentId) {
        log.warn('paymentComplete', 'Missing payment intent ID in redirect', {
            requestId: context.requestId,
            clientIP: context.clientIP
        });
        return checkoutErrorRedirect(undefined, 'missing_payment_intent');
    }

    const stripeConnectedAccountId = searchParams.get('stripe_connected_account_id');

    try {
    
        // Retrieve the payment intent from the connected account
        const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId, {
            expand: ['payment_method']
        }, {
            stripeAccount: stripeConnectedAccountId || undefined
        });

        storeIdForErrorRedirect = paymentIntent.metadata?.storeId;
        const isDelivery = paymentIntent.metadata?.isDelivery === 'true';

        // Check if payment was successful
        if (paymentIntent.status !== 'succeeded') {
            log.warn('paymentComplete', 'Payment intent not succeeded', {
                requestId: context.requestId,
                paymentIntentId,
                status: paymentIntent.status,
                redirectStatus: searchParams.get('redirect_status')
            });
            
            // Redirect to payment error page with status
            return checkoutErrorRedirect(
                storeIdForErrorRedirect, 
                'payment_failed', 
                { status: paymentIntent.status, mode: isDelivery ? 'delivery' : 'pickup' },
                paymentIntent.metadata?.isRescueDeal === 'true',
                paymentIntent.metadata?.userId,
                paymentIntent.metadata?.storeId
            );
        }

        // Extract necessary data from payment intent metadata
        const storeId = paymentIntent.metadata?.storeId;
        const cosmosId = paymentIntent.metadata?.cosmosOrderId;
        const cartId = paymentIntent.metadata?.userId;

        // Validate required metadata
        if (!storeId || !cosmosId || !cartId) {
            const missingParam = !storeId ? 'missing_store_id' :
                              !cosmosId ? 'missing_cosmos_id' :
                              'missing_cart_id';
            
            log.error('paymentComplete', 'Missing critical metadata from payment intent', {
                requestId: context.requestId,
                missingParam,
                hasStoreId: !!storeId,
                hasCosmosId: !!cosmosId,
                hasCartId: !!cartId,
                paymentIntentId
            });
            
            return checkoutErrorRedirect(
                storeId, 
                missingParam,
                undefined, 
                paymentIntent.metadata?.isRescueDeal === 'true', 
                cartId, 
                storeId
            );
        }

        log.info('paymentComplete', 'Retrieving temporary order for processing', {
            requestId: context.requestId,
            storeId,
            cosmosId
        });
        
        // Retrieve temporary order from Cosmos DB
        const { resource: orderRaw } = await containerOrdersUnpaid.item(cosmosId, storeId).read<ExtendedOrderRaw>();

        if (!orderRaw || !orderRaw.id) {
            log.error('paymentComplete', 'Unpaid order record not found in database', {
                requestId: context.requestId,
                cosmosId,
                storeId,
                orderExists: !!orderRaw
            });
            
            return checkoutErrorRedirect(
                orderRaw?.store_name || storeId, 
                'order_not_found',
                undefined,
                paymentIntent.metadata?.isRescueDeal === 'true',
                cartId,
                storeId
            );
        }

        // Check if order has already been processed (avoid double processing)
        try {
            const { resource: existingOrder } = await containerOrders.item(cosmosId, storeId).read<OrderData>();
            if (existingOrder) {
                log.warn('paymentComplete', 'Order already processed, redirecting to success', {
                    requestId: context.requestId,
                    orderId: cosmosId,
                    storeId
                });
                
                // Order already exists, redirect to success page
                return NextResponse.redirect(new URL(`/${storeId}/order/success`, origin), { status: 308 });
            }
        } catch (error) {
            // Order doesn't exist yet, which is expected - continue processing
        }

        log.info('paymentComplete', 'Processing payment completion and creating order', {
            requestId: context.requestId,
            orderId: orderRaw.id,
            storeId
        });

        // Begin transaction for database operations
        await connectionPool.query('BEGIN');

        // Extract customer data from payment method billing details
        const paymentMethod = paymentIntent.payment_method as any; // Expanded payment method
        const billingDetails = paymentMethod?.billing_details;
        
        const email = billingDetails?.email?.toLowerCase()
        const customerName = billingDetails?.name

        log.info('paymentComplete', 'Extracted customer data from payment method', {
            requestId: context.requestId,
            paymentIntentId,
            hasPaymentMethod: !!paymentMethod,
            hasBillingDetails: !!billingDetails,
            email: email,
            customerName: customerName,
            paymentMethodType: paymentMethod?.type
        });


        if (!email) {
            await connectionPool.query('ROLLBACK');
            
            log.error('paymentComplete', 'Missing customer email in payment intent', {
                requestId: context.requestId,
                paymentIntentId
            });
            
            return checkoutErrorRedirect(
                storeIdForErrorRedirect, 
                'missing_email',
                undefined,
                paymentIntent.metadata?.isRescueDeal === 'true',
                cartId,
                storeId
            );
        }

        log.info('paymentComplete', 'Processing user session', {
            requestId: context.requestId,
            email: email,
            paymentIntentId
        });

        // Handle user authentication/creation
        let { user: userSession } = await getCurrentSession();
        let emailVerified, username;
        if (!userSession || userSession.email?.toLowerCase() !== email) {
            log.info('paymentComplete', 'Creating/updating user account', {
                requestId: context.requestId,
                email: email,
                hasExistingUser: !!userSession,
                emailMismatch: userSession ? userSession.email?.toLowerCase() !== email : false
            });
            
            userSession = await creatAccountAction(email, process.env.NEXT_PRIVATE_SECRET_BEARER!);
            emailVerified = false;
            username = customerName || email.split('@')[0];
        } else {
            log.info('paymentComplete', 'Using existing user session', {
                requestId: context.requestId,
                email: email,
                userId: userSession.id
            });
            
            emailVerified = userSession.emailVerified;
            username = userSession.username;
        }

        if (!userSession) {
            await connectionPool.query('ROLLBACK');
            
            log.error('paymentComplete', 'Failed to get or create user session after payment', {
                requestId: context.requestId,
                email,
                paymentIntentId
            });
            
            return checkoutErrorRedirect(
                storeIdForErrorRedirect, 
                'user_creation_failed',
                undefined,
                paymentIntent.metadata?.isRescueDeal === 'true',
                cartId,
                storeId
            );
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
            null, // promotion_id
            null, // referral_id
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
            'paid',
            orderRaw.currency
        ];

        const result = await connectionPool.query(orderQuery, orderValues);

        if (result.rows.length === 0) {
            await connectionPool.query('ROLLBACK');
            return checkoutErrorRedirect(
                storeIdForErrorRedirect, 
                'order_creation_failed',
                undefined,
                paymentIntent.metadata?.isRescueDeal === 'true',
                cartId,
                storeId
            );
        }

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

            isRescueDeal: orderRaw.isRescueDeal,

            // Delivery information
            isDelivery: orderRaw.isDelivery,
            isStoreDelivery: orderRaw.isStoreDelivery,
            isPostDelivery: orderRaw.isPostDelivery,
            isCountryDelivery: orderRaw.isCountryDelivery,
            deliveryAddress: orderRaw.deliveryToAddress 
        };

        // Store final order and clean up
        await containerOrders.items.create(orderData);
        await removeCartByUserIdAndStoreId(cartId, storeId, orderRaw.isDelivery ? "delivery" : "pickup");
        await containerOrdersUnpaid.item(cosmosId, storeId).delete();
        if(orderRaw.isRescueDeal){
            const holds = await getActiveHoldsByUserIdAndStoreId(cartId, storeId);
            await cancelRescueDealCheckout(storeId, holds);
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

        log.info('paymentComplete', 'Order processing completed successfully', {
            requestId: context.requestId,
            orderId: cosmosId,
            storeId,
            storeOrderId: orderData.store_order_id,
            email: email
        });

        const successRedirectUrl = new URL(`/${storeId}/order/success?mode=${isDelivery ? "delivery" : "pickup"}`, origin);
        return NextResponse.redirect(successRedirectUrl, { status: 308 });

    } catch (error: any) {
        // Rollback transaction on any error
        try {
            await connectionPool.query('ROLLBACK');
        } catch (rollbackError) {
            log.error('paymentComplete', 'Error attempting to rollback transaction', {
                requestId: context.requestId,
                error: rollbackError instanceof Error ? rollbackError.message : String(rollbackError)
            });
        }
        
        log.error('paymentComplete', 'Error processing payment completion', {
            requestId: context.requestId,
            paymentIntentId: searchParams?.get('payment_intent'),
            error: error.message || 'Unknown error',
            stack: error.stack
        });
        
        return checkoutErrorRedirect(storeIdForErrorRedirect, 'processing_failed');
    }
} 