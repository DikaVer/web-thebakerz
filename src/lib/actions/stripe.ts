'use server'

import { stripe } from "@/stripe";
import {getCartSessionCookieOrCreate, getCurrentSession} from "@/lib/actions/session";
import { globalPOSTRateLimit } from "@/lib/actions/requests";
import { headers } from 'next/headers';
import { getCart } from "@/lib/actions/cart";
import { getProductsByStoreId } from "@/lib/actions/product";
import {getOrderTime} from "@/app/(store)/[id]/actions";

export async function fetchClientSecret(storeId: string, storeStipeAccountId: string) {
    // Rate limiting check
    if (!(await globalPOSTRateLimit())) {
        return { error: 'Too many requests' };
    }

    const headersList = await headers();
    const origin = headersList.get('origin') || process.env.NEXT_PUBLIC_API_BASE_URL;


    if (!storeId) {
        return { error: 'Store ID is required' };
    }

    const { session, user, store} = await getCurrentSession();
    let userId;
    if (!session || !user) {
        userId = await getCartSessionCookieOrCreate();
    } else {
        userId = user.id;
    }

    if (!userId) return { error: "User not found!" };

    const cartData = await getCart(userId, storeId);

    // Check if cart has items
    if (!cartData || !cartData[storeId] || Object.keys(cartData[storeId]).length === 0) {
        return { error: 'Cart is empty' };
    }

    const {date, time} = await getOrderTime()

    // Check if order time is set
    if (!date || !time) {
        return { error: 'Order time is not set' };
    }

    //Check if data is tommorow
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const orderDateObj = new Date(date);
    const orderDateStr = orderDateObj.toISOString().split('T')[0];
    const tomorrowStr = tomorrow.toISOString().split('T')[0];
    if (orderDateStr === tomorrowStr) {
        return {error: 'Order time is incorrect'};
    }


    // Get products data to fetch prices
    const productsData = await getProductsByStoreId(storeId);

    const taxRate = await stripe.taxRates.create({
        display_name: 'VAT',
        description: 'Value Added Tax',
        jurisdiction: 'NL',
        percentage: 21.0,
        inclusive: true,
    }, { stripeAccount: storeStipeAccountId });

    // Create line items from cart
    const lineItems = [];
    const cartItems = [];
    let subtotal = 0;

    for (const itemId in cartData[storeId]) {
        const cartItem = cartData[storeId][itemId];
        const product = productsData[cartItem.product_id];

        if (!product) {
            continue; // Skip if product not found
        }

        const unitAmount = product.price; // Assuming price is stored in cents
        subtotal += unitAmount * cartItem.quantity;

        lineItems.push({
            price_data: {
                currency: 'eur',
                product_data: {
                    name: product.name,
                    description: product.description || '',
                    images: product.picture ? [product.picture] : [],
                    // tax_code: 'txcd_10000000', // Tangible Goods
                },
                unit_amount: unitAmount,
                // tax_behavior: 'inclusive', // Indicates that tax is included in the unit amount
            },
            quantity: cartItem.quantity,
            tax_rates: [taxRate.id],
        });
        cartItems.push({
            id: product.id,
            name: product.name,
            qty: cartItem.quantity,
            price: product.price,
            variants: cartItem.note ? [cartItem.note] : [],
            const_id: product.constId,
        });
    }

    // Calculate service fee (5%)
    const serviceFee = Math.round(subtotal * 0.05);

    // Add service fee as a separate line item
    // if (serviceFee > 0) {
    //     lineItems.push({
    //         price_data: {
    //             currency: 'usd',
    //             product_data: {
    //                 name: 'Service Fee',
    //                 description: '5% service fee',
    //                 tax_code: 'txcd_10000000',
    //             },
    //             unit_amount: serviceFee,
    //         },
    //         quantity: 1,
    //     });
    // }

    try {

        // Create Checkout Session
        const session = await stripe.checkout.sessions.create({
            ui_mode: 'embedded',
            submit_type: 'pay',
            customer_email: (user && !store) ? user.email : undefined,
            billing_address_collection: 'auto',
            line_items: lineItems,
            mode: 'payment',
            currency: 'eur',
            payment_method_types: ['card', 'ideal', 'paypal', 'revolut_pay', 'bancontact'],
            return_url: `${origin}/api/pay?session_id={CHECKOUT_SESSION_ID}&store_id=${storeId}&store_stripe_account_id=${storeStipeAccountId}`,
            automatic_tax: {
                enabled: false,
            },
            metadata: {
                userId: userId,
                storeId: storeId,
                orderDate: date,
                orderTime: time,
                cartItems: JSON.stringify(cartItems),
            }
        }, { stripeAccount: storeStipeAccountId });


        return session.client_secret;
    } catch (error) {
        console.error('Error creating checkout session:', error);
        return { error: 'Failed to create checkout session' };
    }
}