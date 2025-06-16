'use server';
import * as z from "zod";
import {CustomerOrderSchema} from "@/lib/utils/schemas";
import {getCurrentSession} from "@/lib/actions/session";
import { removeCartByUserIdAndStoreId, Variant} from "@/lib/actions/cart";
import {connectionPool, containerOrders } from "@/db";
import Stripe from "stripe";
import { getTranslations } from "next-intl/server";
import {getCurrentStoreByUserIdAndStoreId} from "@/lib/api/store-api";
import { revalidateTag } from "next/cache";
import {globalPOSTRateLimit} from "@/lib/utils/helper/requests";
import { getOrderTime } from "@/app/(store)/[id]/actions";
import { now } from "@internationalized/date";
import { CalendarDateTime } from "@internationalized/date";
import { scheduledToCalendarDateTime } from "../utils";
import {calculateItemTotalPrice} from "@/lib/utils/helper/calculate-total-price-variants";
import { calculateTotals } from "@/lib/utils/price/price-calculations";
import { getCurrentProducts } from "@/lib/api/products-api";
import { v4 as uuidv4 } from 'uuid';
import { sendOrderPlaced } from "../email-send-request";
import { DeliveryAddress } from "@/app/(store)/[id]/delivery-actions";
import { getCurrentCart, getCurrentCartType } from "../api/cart-api";
type TranslationFunction = (key: string, params?: Record<string, string | number>) => string;

// Order data interface
export interface OrderData {
    id: string;
    seq_id: number;
    store_order_id: string;
    store_id: string;
    store_name: string;
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
    orderNote?: string; // Order special instructions
    
    // Pricing details
    priceData: PriceOrderData;

    // Delivery details
    isDelivery: boolean;
    isStoreDelivery: boolean;
    isPostDelivery: boolean;
    isCountryDelivery: boolean;
    deliveryAddress: DeliveryAddress | null; // Store the structured address

    // Rescue Deal details
    isRescueDeal: boolean;

    // Timestamps
    cancelledAt?: Date;
    refundedAt?: Date;
}

export interface ExtendedOrderRaw extends OrderRaw {
    // Added fields from stripe.ts
    isDelivery: boolean;
    store_name: string;
    isStoreDelivery: boolean;
    isPostDelivery: boolean;
    isCountryDelivery: boolean;
    deliveryToAddress: DeliveryAddress | null;
    deliveryFromAddress?: {
        lat: number;
        lng: number;
    };
    orderNote?: string; // Order special instructions
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
    isRescueDeal: boolean;
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

export type OrderStatus = "new" | "started" | "ready" | "completed" | "cancelled" | 'refunded';

export type OrderProducts = Array<OrderProduct>;

export type Customer = {
    email_customer: string;
    email_verified: boolean;
    name_customer: string;
    phone_number?: string | null;
    address: Stripe.Address | null;
    payment_method: string | null;
    payment_intent: string | Stripe.PaymentIntent | null;
    payment_name?: string | null;
    tax_id?: string | null;
}

export type OrderProduct = {
    id: string;
    name: string;
    note?: string;
    variants?: Variant[];
    image: string;
    qty: number;
    price: number;
    unitAmount: number;
    ingredients?: string[];
    allergies?: string[];
    itemTotalInclVat?: number;
};

// This array defines the valid progression order.
const validStatusOrder = ['cancelled', 'refunded', "new", "started", "ready", "completed"];

// This function updates the status of an order in the database.
async function updateOrderInCosmos(storeId: string, orderId: string, email: string, newStatus: string) {
    try {
        const partitionKeyValue = [storeId, email.toLowerCase()];
        // Example Cosmos DB update operation
        await containerOrders.item(orderId, partitionKeyValue).patch({
            operations: [
                { op: 'replace', path: '/order_status', value: newStatus },
                { op: 'set', path: `/${newStatus}_at`, value: newStatus },
            ]
        });
    } catch (error) {
        console.error('Error updating order in Cosmos DB:', error);
        throw new Error('Failed to update order in Cosmos DB');
    }
}

async function updateOrderInPostgreSQL(storeId: string, seqId: string, email: string) {
    try {
        const result = await connectionPool.query(
            `UPDATE orders 
             SET completed = $1
             WHERE id = $2 AND store_id = $3 AND customer = $4
             RETURNING id`,
            [true, seqId, storeId, email.toLowerCase()]
        );

        if (result.rows.length === 0) {
            throw new Error('Order not found or update failed');
        }
    } catch (error) {
        console.error('Error updating order in PostgreSQL:', error);
        throw new Error('Failed to update order in PostgreSQL');
    }
}

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
    const t = await getTranslations("app/lib/actions/order") as TranslationFunction;

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

    const {store} = await getCurrentStoreByUserIdAndStoreId(user.id, storeId);
    if (!store) {
        return { error: t("storeNotFound") };
    }

    // Retrieve the user's cart data for the current store
    const cartData = await getCurrentCartType(store.id, 'pickup'); 

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
    const productsData = await getCurrentProducts(storeId);
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

        revalidateTag('cart');
        revalidateTag('orders');


        return { orderId: cosmosId };
    } catch (error) {
        // Rollback transaction on error
        await connectionPool.query("ROLLBACK");
        console.error("Error creating checkout session:", error);
        return { error: t("failedCreateCheckout") };
    }
};

export async function getOrdersAdminByDateRange(fromDate: string, toDate: string): Promise<OrderData[]> {
    const t = await getTranslations("app/lib/actions/order") as TranslationFunction;

    try {
        const {user} = await getCurrentSession();
        if (!user) {return [];}

        if (user.role !== "admin") {return [];}

        const fromDateObj = new Date(fromDate);
        const toDateObj = new Date(toDate);

        const fromDateString = `${fromDateObj.getFullYear()}-${fromDateObj.getMonth() + 1}-${fromDateObj.getDate()}`;
        const toDateString = `${toDateObj.getFullYear()}-${toDateObj.getMonth() + 1}-${toDateObj.getDate()}`;

        // Query using the UDF
        const querySpec = {
            query: `
                SELECT * FROM c
                  WHERE udf.compareDateStrings(c.scheduled_time.date, @fromDate) = true
                  AND udf.compareDateStrings(@toDate, c.scheduled_time.date) = true
                  AND c.isStoreDelivery = false
                  AND c.isDelivery = true
            `,
            parameters: [
                { name: "@fromDate", value: fromDateString },
                { name: "@toDate", value: toDateString }
            ]
        };

        const { resources: orders } = await containerOrders.items.query(querySpec).fetchAll();

        if (!orders || orders.length === 0) {
            return [];
        }

        // Map the orders to the desired format
        return orders;
    } catch (error) {
        console.error("Error fetching orders by date range:", error);
        return [];
    }
}

export async function getOrdersByDateRange(storeId: string, fromDate: string, toDate: string): Promise<OrderData[]> {
    const t = await getTranslations("app/lib/actions/order") as TranslationFunction;
    
    try {
        const {user} = await getCurrentSession();
        if (!user) {return [];}

        if (user.role === "admin") {
            return await getOrdersAdminByDateRange(fromDate, toDate);
        }

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

        const orders = await response.json();


        return orders;
    } catch (error) {
        console.error("Error fetching orders by date range:", error);
        return [];
    }
}

export async function updateOrderStatus(storeId: string, orderId: string, seqId: string, email: string, status: string): Promise<{ok: boolean, error?: string}> {
    const t = await getTranslations("app/lib/actions/order") as TranslationFunction;
    const normalizedEmail = email.toLowerCase();
    try {
        const {user} = await getCurrentSession();
        if (!user) {return {ok: false, error: "User not found"};}

        if (user.role !== "admin") {
            const {store} = await getCurrentStoreByUserIdAndStoreId(user.id, storeId);
            if (!store) {return {ok: false, error: "Store not found"};}

            if (!store || store.id !== storeId) {return {ok: false, error: "Store mismatch"};}
        } 

        const orderData = await getOrder(storeId, orderId, normalizedEmail);

        if (!orderData) {
            return {
                ok: false,
                error: t("orderNotFound")
            }
        }


        if (orderData.id !== orderId || orderData.store_id !== storeId || orderData.customer_email !== normalizedEmail) {
            return {
                ok: false,
                error: t("invalidData")
            }
        }

        if(orderData.order_status === "completed") {
            return {
                ok: false,
                error: t("orderAlreadyCompleted")
            }
        }

        const newStatus = status.toLowerCase();
        const newIndex = validStatusOrder.indexOf(newStatus);

        if (newIndex === -1) {
            return {
                ok: false,
                error: t("invalidStatus")
            }
        }

        if(orderData.isDelivery && !orderData.isStoreDelivery && newStatus === "completed") {
            if (user?.role !== "admin") {
                return {
                    ok: false,
                    error: t("cannotChangeStatus")
                }
            }
        }

        if (newStatus === "completed") {
            orderData.status === 'paid' && await updateOrderInPostgreSQL(storeId, seqId, normalizedEmail);
            await updateOrderInCosmos(storeId, orderId, normalizedEmail, newStatus);
        } else {
            await updateOrderInCosmos(storeId, orderId, normalizedEmail, newStatus);
        }

        revalidateTag('orders');
        
        return { ok: true };
    } catch (error) {
        console.error("Error updating order status:", error);
        return {
            ok: false,
            error: t("failedUpdateOrderStatus")
        };
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
            'Email': email.toLowerCase(),
            'Authorization': `Bearer ${process.env.NEXT_PRIVATE_SECRET_BEARER}`,
        },
        next: {
            tags: ['orders'],
            revalidate: 300
        }
    }).then(res => res.json());
};

export async function getNewOrderCount(storeId: string): Promise<number> {
    const t = await getTranslations("app/lib/actions/order") as TranslationFunction;
    
    try {
        const querySpec = {
            query: `
                SELECT * FROM c
                WHERE c.store_id = @storeId
                AND c.order_status = 'new'
            `,
            parameters: [
                { name: "@storeId", value: storeId }
            ]
        };

        const { resources: orders } = await containerOrders.items.query(querySpec).fetchAll();

        return orders.length;
    } catch (error) {
        console.error("Error fetching new orders:", error);
        return 0;
    }
}

/**
 * Fetches all orders from the database for admin users.
 *
 * @returns {Promise<OrderData[]>} A promise that resolves to an array of all orders.
 */
export async function getAllOrdersAdmin(): Promise<OrderData[]> {

    try {
        const { user } = await getCurrentSession();
        if (!user) {
            console.error("Admin order fetch: No user session found.");
            return [];
        }

        if (user.role !== "admin") {
            console.error(`Admin order fetch: User ${user.email} is not an admin.`);
            return [];
        }

        // Query to select all order documents
        const querySpec = {
            query: "SELECT * FROM c"
        };

        const { resources: orders } = await containerOrders.items.query(querySpec).fetchAll();

        if (!orders) {
            // console.log("Admin order fetch: No orders found.");
            return [];
        }

        // console.log(`Admin order fetch: Found ${orders.length} orders.`);
        return orders;
    } catch (error) {
        console.error("Error fetching all admin orders:", error);
        // Consider more specific error handling or logging
        throw new Error("Failed to fetch orders"); // Use a generic error message for the client
    }
}

