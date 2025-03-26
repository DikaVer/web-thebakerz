'use server'

import { stripe } from "@/stripe";
import {getCartSessionCookieOrCreate, getCurrentSession} from "@/lib/actions/session";
import { globalPOSTRateLimit } from "@/lib/actions/requests";
import { headers } from 'next/headers';
import { getCart } from "@/lib/actions/cart";
import { getProductsByStoreId } from "@/lib/actions/product";
import {getOrderTime} from "@/app/(store)/[id]/actions";
import {OrderRaw} from "@/lib/actions/order";
import {v4 as uuidv4} from "uuid";
import {containerOrdersUnpaid} from "@/db";
import {getBusinessStoreData} from "@/lib/actions/store";
import {calculateTotals} from "@/lib/price/tax";
import {calculateItemTotalPrice} from "@/lib/helper/calculate-total-price-variants";
import {CalendarDateTime, now} from "@internationalized/date";
import {scheduledToCalendarDateTime} from "@/lib/utils";

function roundToTwoDecimals(num: number): number {
    return Math.round(num);
}

export async function fetchClientSecret(storeId: string, storeStipeAccountId: string) {
    // Rate limiting check
    if (!(await globalPOSTRateLimit())) {
        return { error: 'Too many requests' };
    }


    const origin = process.env.NEXT_PUBLIC_API_BASE_URL;


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

    // Prevent ordering for past dates
    const today = now("Europe/Amsterdam")
    const todayCalendar = new CalendarDateTime(today.year, today.month, today.day, today.hour, today.minute);
    const orderDateObj = scheduledToCalendarDateTime({
        date,
        time
    })
    if (orderDateObj < todayCalendar) {
        return { error: "Cannot place orders for past dates or time is near to end" };
    }

    // Get products data to fetch prices
    const productsData = await getProductsByStoreId(storeId);

    const storeBusinessData = await getBusinessStoreData(storeId);
    if (!storeBusinessData) {
        return { error: 'Store not found' };
    }
    const applyVat = !storeBusinessData.kor;

    const taxRate = await stripe.taxRates.create({
        display_name: 'VAT',
        description: 'Value Added Tax',
        jurisdiction: 'NL',
        percentage: 9.0,
        inclusive: false,
    });

    // Create line items from cart
    const lineItems = [];
    const cartItems = [];
    let total = 0;

    for (const itemId in cartData[storeId]) {
        const cartItem = cartData[storeId][itemId];
        const product = productsData[cartItem.product_id];

        if (!product) {
            continue; // Skip if product not found
        }

        const unitAmount = calculateItemTotalPrice(cartItem.variants, product.price); // Assuming price is stored in cents
        total += unitAmount * cartItem.quantity;

        const { subtotal } = calculateTotals(unitAmount, applyVat);
        lineItems.push({
            price_data: {
                currency: 'eur',
                product_data: {
                    name: product.name,
                    description: product.description || undefined,
                    images: product.picture ? [product.picture] : [],
                    // tax_code: 'txcd_10000000', // Tangible Goods
                },
                unit_amount: subtotal,
            },
            quantity: cartItem.quantity,
            tax_rates: applyVat ? [taxRate.id] : undefined,
        });
        cartItems.push({
            id: product.id,
            name: product.name,
            qty: cartItem.quantity,
            price: product.price,
            note: cartItem.note,
            variants: cartItem.variants,
            const_id: product.constId,
            ingredients: product.ingredients,
            allergies: product.allergies,
            unitAmount: unitAmount,
        });
    }

    // const { platform_fee } = calculateTotals(total, applyVat);
    //
    // if ( platform_fee > 0) {
    //     const customerFee = {
    //         price_data: {
    //             currency: 'eur',
    //             product_data: {
    //                 name: 'Service Fee', // Customize fee name as needed
    //             },
    //             unit_amount:  platform_fee, // Fee amount in cents (500 = €5.00)
    //         },
    //         quantity: 1,
    //     };
    //     lineItems.push(customerFee)
    //     total = Math.round(total + platform_fee);
    // }

    if (total < 1000) {
        return { error: 'Minimum order amount is €10' };
    }

    try {

        const cosmosId = uuidv4();

        // Create Checkout Session
        const session = await stripe.checkout.sessions.create({
            ui_mode: 'embedded',
            submit_type: 'pay',
            customer_email: (user && !store) ? user.email : undefined,
            billing_address_collection: total >= 10000 ? 'required' : 'auto', //Change to total, when it is needed
            tax_id_collection: {
                enabled: total >= 10000,
            },
            line_items: lineItems,
            mode: 'payment',
            currency: 'eur',
            payment_method_types: ['card', 'ideal', 'paypal', 'revolut_pay', 'bancontact'],
            return_url: `${origin}/api/pay?session_id={CHECKOUT_SESSION_ID}&store_id=${storeId}&store_stripe_account_id=${storeStipeAccountId}`,
            automatic_tax: {
                enabled: false,
            },
            payment_intent_data: {
              transfer_data: {
                  destination: storeStipeAccountId,
              }
            },
            metadata: {
                userId: userId,
                storeId: storeId,
                cosmosId: cosmosId
            }
        });

        const orderRaw: OrderRaw = {
            id: cosmosId,
            store_id: storeId,
            createdAt: new Date(),
            scheduled_time: {
                date: date,
                time: time
            },
            customer_email: (user && !store) ? user.email : undefined,
            productsData: cartItems,
        }

        await containerOrdersUnpaid.items.create(orderRaw);

        return session.client_secret;
    } catch (error) {
        console.error('Error creating checkout session:', error);
        return { error: 'Failed to create checkout session' };
    }
}