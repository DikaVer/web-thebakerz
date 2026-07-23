/**
 * @fileoverview Server action for creating manual (merchant-entered) orders.
 *
 * Exports createOrder, which lets a store owner or admin place a pickup order
 * on behalf of a customer: it validates the form with CustomerOrderSchema,
 * checks rate limits, role, store ownership, cart contents, and scheduled
 * order time, calculates VAT-aware totals, writes the order document to the
 * Cosmos DB orders container, clears the cart, sends a confirmation email,
 * and revalidates the cart and orders cache tags.
 */
'use server';
import * as z from "zod";
import {CustomerOrderSchema} from "@/lib/utils/schemas";
import {getCurrentSession} from "@/lib/actions/session";
import { removeCartByUserIdAndStoreId} from "@/lib/actions/cart";
import {connectionPool, containerOrders } from "@/db";
import { getTranslations } from "next-intl/server";
import {getStoreByUserIdAndStoreIdAPI} from "@/lib/api/GET/store-api";
import { globalPOSTRateLimit } from "@/lib/utils/helper/requests";
import { getCartTypeAPI } from "../api/GET/cart-api";
import { getOrderTime } from "@/app/(store)/[id]/actions";
import { now } from "@internationalized/date";
import { CalendarDateTime } from "@internationalized/date";
import { scheduledToCalendarDateTime } from "../utils";
import { getProductsAPI } from "../api/GET/products-api";
import { calculateItemTotalPrice } from "@/lib/utils/helper/calculate-total-price-variants";
import { calculateTotals } from "@/lib/utils/price/price-calculations";
import { v4 as uuidv4 } from 'uuid';
import { OrderData } from "./order";
import { sendOrderPlaced } from "../email-send-request";
import { revalidateTag } from "next/cache";
/**
 * Creates a new order based on the customer's form data and cart contents
 *
 * This function handles the full order creation process:
 * 1. Validates customer input and cart data
 * 2. Checks rate limits, session status, and order time validity
 * 3. Creates order records in both PostgreSQL and Azure Cosmos DB using a transaction with commit and rollback
 * 4. Clears the customer's cart and sends a confirmation email
 *
 * @param {z.infer<typeof CustomerOrderSchema>} formData - Validated customer information
 * @returns {Promise<{error?: string; orderId?: string}>} Object with an error message or the created order ID
 */
export const createOrder = async (
    formData: z.infer<typeof CustomerOrderSchema>,
    storeId: string
):Promise<{error?: string; orderId?: string}> => {
    const t = await getTranslations("app/lib/actions/order");

    // Check rate limiting
    if (!(await globalPOSTRateLimit())) {
        return { error: t("tooManyRequests") };
    }

    // Validate form data
    const validation = CustomerOrderSchema.safeParse(formData);
    if (!validation.success) {
        return { error: t("invalidFields") };
    }

    // Get session, user, and store details
    const { user } = await getCurrentSession();
    if (!user) {
        return { error: t("sessionExpired") };
    }

    if(user.role !== "bakerz" && user.role !== "admin"){
      return { error: t("userNotAuthorized") };
    }

    const {store} = await getStoreByUserIdAndStoreIdAPI(user.id, storeId);
    if (!store) {
        return { error: t("storeNotFound") };
    }

    // Retrieve the user's cart data for the current store
    const cartData = await getCartTypeAPI(store.id, 'pickup');

    if (!cartData || !cartData[store.id] || Object.keys(cartData[store.id]).length === 0) {
        return { error: t("cartEmpty") };
    }

    const normalizedEmail = formData.email.toLowerCase();

    // Get scheduled order time
    const { date, time } = await getOrderTime(store.id);
    if (!date || !time) return { error: t("orderTimeNotSet") };

    // Prevent ordering for past dates
    const today = now("Europe/Amsterdam")
    const todayCalendar = new CalendarDateTime(today.year, today.month, today.day, today.hour, today.minute);
    const orderDateObj = scheduledToCalendarDateTime({
        date,
        time
    })
    if (orderDateObj < todayCalendar) {
        return { error: t("pastDateOrder") };
    }

    // 7. Calculate Totals & Minimum Order Check
    // -----------------------------------------
    const productsData = await getProductsAPI(storeId); 
    const applyVat = !store.kor; // Use KOR status from storeData

    // Calculate item subtotal (including VAT if applicable)
    let itemsInclVat = 0;
    const cartItemsForOrder = []; // Store details for the unpaid order

    for (const itemId in cartData[storeId]) {
        const cartItem = cartData[storeId][itemId];
        const product = productsData[cartItem.product_id];
        if (!product) continue; 

        const itemTotalInclVat = calculateItemTotalPrice(cartItem.variants, product.price, cartItem.quantity); 
        itemsInclVat += itemTotalInclVat;

        cartItemsForOrder.push({
            id: product.id,
            name: product.name,
            qty: cartItem.quantity,
            price: product.price, // Base price
            note: cartItem.note,
            variants: cartItem.variants,
            ingredients: product.ingredients,
            allergies: product.allergies,
            image: product.picture,
            unitAmount: calculateItemTotalPrice(cartItem.variants, product.price), // Price per unit incl VAT
            itemTotalInclVat: itemTotalInclVat // Total for this line incl VAT
        });
    }


    // Calculate final totals using the updated function
    const {
        itemExclVat,
        deliveryFeeExclVat,
        serviceFeeExclVat,
        serviceFeeInclVat,
        itemVat,
        deliveryVat,
        serviceVat,
        totalVat,
        totalInclVat,
        totalExclVat
    } = calculateTotals(itemsInclVat, applyVat, 0, true); 


    try {
        const cosmosId = uuidv4();  
        // Create final order record in Cosmos DB
        const orderData: OrderData = {
            id: cosmosId,
            seq_id: -1,
            store_order_id: "Manual Order",
            store_id: storeId,
            store_name: store.ownerName || "Bakery",
            customer_email: normalizedEmail,
            customer: {
                email_customer: normalizedEmail,
                email_verified: false,
                name_customer: formData.name,
                phone_number: formData.phoneNumber,
                address: null,
                payment_method: null,
                payment_intent: null,
                payment_name: null,
                tax_id: null,
            },
            createdAt: new Date(),
            status: "manual",
            scheduled_time: {
                date: date,
                time: time
            },
            order_status: 'new',
            completed: false,
            productsData: cartItemsForOrder,
            isRescueDeal: false,
            // Price information
            priceData: {
                itemInclVat: itemsInclVat,
                itemExclVat: itemExclVat,
                deliveryFeeInclVat: 0,
                deliveryFeeExclVat: 0,
                serviceFeeInclVat: 0,
                serviceFeeExclVat: 0,
                itemVat: itemVat,
                deliveryVat: 0,
                serviceVat: 0,
                totalInclVat: totalInclVat,
                totalExclVat: totalExclVat,
                totalVat: totalVat
            },

            // Delivery information
            isDelivery: false,
            isStoreDelivery: true,
            isPostDelivery: false,
            isCountryDelivery: false,
            deliveryAddress: null
        };

        // Store final order and clean up
        await containerOrders.items.create(orderData);
        await removeCartByUserIdAndStoreId(user.id, storeId, orderData.isDelivery ? "delivery" : "pickup");

         // Send confirmation email and invalidate cache
         sendOrderPlaced({
            orderData: orderData,
            identifier: normalizedEmail, // Use primary email for notification
        }); 

        revalidateTag('cart', 'max');
        revalidateTag('orders', 'max');


        return { orderId: cosmosId };
    } catch (error) {
        // Rollback transaction on error
        await connectionPool.query("ROLLBACK");
        console.error("Error creating checkout session:", error);
        return { error: t("failedCreateCheckout") };
    }
};