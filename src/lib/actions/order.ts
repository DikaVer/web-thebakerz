'use server';
import * as z from "zod";
import {CustomerOrderSchema} from "@/lib/schemas";
import {getCurrentSession} from "@/lib/actions/session";
import {Variant} from "@/lib/actions/cart";
import {containerOrders} from "@/db";
import Stripe from "stripe";
import { getTranslations } from "next-intl/server";
import { AddressFormType } from "@/components/providers/delivery-provider";
import {getCurrentStoreByUserIdAndStoreId} from "@/lib/actions/store";

type TranslationFunction = (key: string, params?: Record<string, string | number>) => string;

// Order data interface
export interface OrderData {
    id: string;
    seq_id: number;
    store_order_id: string;
    store_id: string;
    customer_email: string;
    customer: Customer;
    createdAt: Date;
    status: "paid" | "manual" ;
    scheduled_time: {
        date: string;
        time: string;
    };
    order_status: OrderStatus;
    completed: boolean;
    productsData: OrderProducts;
    
    // Pricing details
    priceData: PriceOrderData;

    // Delivery details
    isDelivery: boolean;
    isStoreDelivery: boolean;
    deliveryAddress?: AddressFormType; // Store the structured address

    // Timestamps
    cancelledAt?: Date;
    refundedAt?: Date;
}

export interface PriceOrderData {
    itemExclVat: number;
    deliveryFeeExclVat: number;
    serviceFeeExclVat: number;
    itemInclVat: number;
    deliveryFeeInclVat: number;
    serviceFeeInclVat: number;
    itemVat: number;
    deliveryVat: number;
    serviceVat: number;
    totalInclVat: number;
    totalVat: number;
    totalExclVat: number;
}

export interface OrderRaw {
    id: string;
    store_id: string;
    createdAt: Date;
    customer_email?: string;
    scheduled_time: {
        date: string;
        time: string;
    };
    productsData: OrderProducts;
}

export interface ExtendedOrderRaw extends OrderRaw {
    // Added fields from stripe.ts
    isDelivery: boolean;
    isStoreDelivery: boolean;
    deliveryToAddress?: AddressFormType;
    deliveryFromAddress?: {
        lat: number;
        lng: number;
    };
    itemExclVat: number;
    deliveryFeeExclVat: number;
    serviceFeeExclVat: number;
    itemInclVat: number;
    deliveryFeeInclVat: number;
    serviceFeeInclVat: number;
    itemVat: number;
    deliveryVat: number;
    serviceVat: number;
    totalInclVat: number;
    totalVat: number;
    totalExclVat: number;
    region: string;
    currency: string;
    transfer_data: [
        {
            destination: string;
            amount: number;
            app_fee: number;
        }
    ];
    status: string;
}

export type OrderStatus = "new" | "started" | "ready" | "completed" | "cancelled" | 'refunded';

export type OrderProducts = Array<OrderProduct>;

export type Customer = {
    email_customer: string;
    email_verified: boolean;
    name_customer: string;
    phone_number?: string | null;
    address: Stripe.Address | null;
    payment_method?: Array<string>;
    payment_name?: string | null;
    tax_id?: string | null;
}

export type OrderProduct = {
    id: string;
    name: string;
    note?: string;
    variants?: Variant[];
    qty: number;
    price: number;
    unitAmount: number;
    const_id: string;
    ingredients?: string[];
    allergies?: string[];
    itemTotalInclVat?: number;
};

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
    formData: z.infer<typeof CustomerOrderSchema>
):Promise<{error?: string; orderId?: string}> => {
    // const t = await getTranslations("app/lib/actions/order") as TranslationFunction;
    //
    // // Check rate limiting
    // if (!(await globalPOSTRateLimit())) {
    //     return { error: t("tooManyRequests") };
    // }
    //
    // // Validate form data
    // const validation = CustomerOrderSchema.safeParse(formData);
    // if (!validation.success) {
    //     return { error: t("invalidFields") };
    // }
    //
    // // Get session, user, and store details
    // const { session, user, store} = await getCurrentSession();
    // const userId = (!session || !user) ? await getCartSessionCookieOrCreate() : user.id;
    // if (!store) return { error: t("storeNotFound") };
    // if (!userId) return { error: t("userNotFound") };
    //
    // // Retrieve the user's cart data for the current store
    // const cartData = await getCart(userId, store.id);
    //
    // if (!cartData || !cartData[store.id] || Object.keys(cartData[store.id]).length === 0) {
    //     return { error: t("cartEmpty") };
    // }
    //
    // // Get scheduled order time
    // const { date, time } = await getOrderTime(store.id);
    // if (!date || !time) return { error: t("orderTimeNotSet") };
    //
    // // Prevent ordering for past dates
    // const today = now("Europe/Amsterdam")
    // const todayCalendar = new CalendarDateTime(today.year, today.month, today.day, today.hour, today.minute);
    // const orderDateObj = scheduledToCalendarDateTime({
    //     date,
    //     time
    // })
    // if (orderDateObj < todayCalendar) {
    //     return { error: t("pastDateOrder") };
    // }
    //
    // // Get products data and prepare cart items with subtotal calculation
    // const productsData = await getProductsByStoreId(store.id);
    //
    // // Prepare cart items and calculate subtotal
    // const cartItems = [];
    // let amount = 0;
    //
    // for (const itemId in cartData[store.id]) {
    //
    //     const cartItem = cartData[store.id][itemId];
    //     const product = productsData[cartItem.product_id];
    //
    //     if (!product) continue;
    //
    //     amount += calculateItemTotalPrice(cartItem.variants, product.price);
    //
    //     cartItems.push({
    //         id: product.id,
    //         name: product.name,
    //         qty: cartItem.quantity,
    //         price: product.price,
    //         variants: cartItem.variants,
    //         note: cartItem.note,
    //         const_id: product.constId,
    //         ingredients: product.ingredients,
    //         allergies: product.allergies,
    //         unitAmount: amount
    //     });
    // }
    //
    //
    // // Generate a unique ID for the order
    // const cosmosId = uuidv4();
    //
    // try {
    //     // Begin PostgreSQL transaction
    //     await connectionPool.query("BEGIN");
    //
    //     // Insert order record into PostgreSQL
    //     const result = await connectionPool.query(
    //         `
    //                 INSERT INTO payment_orders
    //                 (store_id, store_order_id, email_customer, amount, product_ids, status, cosmos_id)
    //                 VALUES
    //                     (
    //                         $1,
    //                         (SELECT COALESCE(COUNT(*) + 1, 1) FROM payment_orders WHERE store_id = $7),
    //                         $2,
    //                         $3,
    //                         $4::text[],
    //                         $5,
    //                         $6
    //                     )
    //                     RETURNING id, order_date, store_order_id
    //             `,
    //         [
    //             store.id,
    //             formData.email,
    //             amount,
    //             cartItems.map(item => item.id || "Error"),
    //             "manual",
    //             cosmosId,
    //             store.id
    //         ]
    //     );
    //     if (result.rows.length === 0) {
    //         await connectionPool.query("ROLLBACK");
    //         return { error: t("failedCreateOrder") };
    //     }
    //
    //     // Calculate tax and adjusted amounts using the updated calculateTotals
    //     // Assuming manual orders via createOrder are always pickup (deliveryFee = 0)
    //     const {
    //         totalVat,           // Use totalVat instead of vat
    //         totalInclVat,       // Use totalInclVat instead of total
    //         itemExclVat // Use itemSubtotalExclVat instead of subtotal for sub_amount?
    //                             // Let's keep sub_amount as the total *excluding* tax for consistency
    //     } = calculateTotals(amount, !store.kor, 0); // Pass 0 for delivery fee
    //
    //     // Calculate subtotal excluding VAT
    //     const subAmountExclVat = totalInclVat - totalVat;
    //
    //     // Prepare order data for Cosmos DB
    //     const orderData: OrderData = {
    //         id: cosmosId,
    //         seq_id: result.rows[0].id,
    //         store_order_id: result.rows[0].store_order_id,
    //         store_id: store.id,
    //         customer_email: formData.email,
    //         customer: {
    //             email_customer: formData.email,
    //             email_verified: false,
    //             name_customer: formData.name,
    //             phone_number: formData.phoneNumber,
    //             address: null // Manual orders don't have Stripe address details
    //         },
    //         createdAt: result.rows[0].order_date,
    //         status: "manual",
    //         scheduled_time: { date, time },
    //         order_status: "new",
    //         completed: false,
    //         productsData: cartItems,
    //
    //         // Use new calculated values
    //         itemsSubtotalInclVat: amount, // Original amount included VAT if applicable
    //         deliveryFeeInclVat: 0,       // Manual order assumed pickup
    //         sub_amount: subAmountExclVat, // Total excluding VAT
    //         tax_amount: totalVat,       // Total VAT amount
    //         amount: totalInclVat,       // Final total including VAT
    //
    //         isDelivery: false,           // Manual order assumed pickup
    //         // deliveryAddress, deliveryRegionName are undefined for pickup
    //     };
    //
    //     // Create order record in Cosmos DB
    //     await containerOrders.items.create(orderData);
    //
    //     // Clear cart, send confirmation email, and invalidate cache
    //     await removeCartByUserIdAndStoreId(userId, store.id);
    //     sendOrderPlaced({ orderData, identifier: formData.email });
    //
    //     revalidateTag('cart');
    //     revalidateTag('orders');
    //
    //     // Commit transaction
    //     await connectionPool.query("COMMIT");
    //     return { orderId: cosmosId };
    // } catch (error) {
    //     // Rollback transaction on error
    //     await connectionPool.query("ROLLBACK");
    //     console.error("Error creating checkout session:", error);
    //     return { error: t("failedCreateCheckout") };
    // }
    return {}
};

export async function getOrdersByDateRange(storeId: string, fromDate: string, toDate: string): Promise<OrderData[]> {
    const t = await getTranslations("app/lib/actions/order") as TranslationFunction;
    
    try {
        const {user} = await getCurrentSession();
        if (!user) {return [];}

        const {store} = await getCurrentStoreByUserIdAndStoreId(user.id, storeId);
        if (!store) {return [];}

        if (!store || store.id !== storeId) {return [];}

        const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/store/orders/range`, {
            headers: {
                'Store-Id': store.id,
                'From-Date': fromDate,
                'To-Date': toDate,
                'Authorization': `Bearer ${process.env.NEXT_PRIVATE_SECRET_BEARER}`,
            },
            next: {
                tags: ['orders'],
                revalidate: 300
            }
        });

        if (!response.ok) {
            throw new Error(t("failedFetchOrders"));
        }

        return response.json();
    } catch (error) {
        console.error("Error fetching orders by date range:", error);
        return [];
    }
}

export async function updateOrderStatus(storeId: string, orderId: string, seqId: string, email: string, status: string): Promise<boolean> {
    try {
        const {user} = await getCurrentSession();
        if (!user) {return false;}

        const {store} = await getCurrentStoreByUserIdAndStoreId(user.id, storeId);
        if (!store) {return false;}

        if (!store || store.id !== storeId) {return false;}

        const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/store/order/updateStatus`, {
            method: 'POST',
            headers: {
                'Store-Id': store.id,
                'Order-Id': orderId,
                'Seq-Id': seqId,
                'Email': email,
                'Status': status,
                'Authorization': `Bearer ${process.env.NEXT_PRIVATE_SECRET_BEARER}`,
            }
        });
        return response.ok;
    } catch (error) {
        console.error("Error fetching orders by date range:", error);
        return false;
    }
};

export async function getOrder(storeId: string, orderId: string, email: string): Promise<OrderData | null> {
    const t = await getTranslations("app/lib/actions/order") as TranslationFunction;
    
    try {
        if (!storeId || !orderId || !email) {return null;}
        const partitionKeyValue = [storeId, email];
        const { resource: order } = await containerOrders.item(orderId, partitionKeyValue).read();
        return order ? order : null;
    } catch (error) {
        console.error("Error fetching store data:", error);
        throw new Error(t("failedFetchOrder"));
    }
}

export const getCurrentOrder = async (storeId: string, orderId: string, email: string): Promise<OrderData> => {
    return await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/store/order`, {

        headers: {
            'Store-Id': storeId,
            'Order-Id': orderId,
            'Email': email,
            'Authorization': `Bearer ${process.env.NEXT_PRIVATE_SECRET_BEARER}`,
        },
        next: {
            tags: ['orders'],
            revalidate: 300
        }
    }).then(res => res.json());
};

