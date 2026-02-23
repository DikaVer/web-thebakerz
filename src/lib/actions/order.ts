'use server';

import {getCurrentSession} from "@/lib/actions/session";
import {Variant} from "@/lib/actions/cart";
import {connectionPool, containerOrders } from "@/db";
import Stripe from "stripe";
import { getTranslations } from "next-intl/server";
import {getStoreByUserIdAndStoreIdAPI} from "@/lib/api/GET/store-api";
import { revalidateTag } from "next/cache";
import { DeliveryAddress } from "@/app/(store)/[id]/delivery-actions";
import { getOrderAPI } from "../api/GET/order-api";
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
            zero_commission: boolean;
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

export async function updateOrderStatus(storeId: string, orderId: string, seqId: string, email: string, status: string): Promise<{ok: boolean, error?: string}> {
    const t = await getTranslations("app/lib/actions/order") as TranslationFunction;
    const normalizedEmail = email.toLowerCase();
    try {
        const {user} = await getCurrentSession();
        if (!user) {return {ok: false, error: "User not found"};}

        if (user.role !== "admin") {
            const {store} = await getStoreByUserIdAndStoreIdAPI(user.id, storeId);
            if (!store) {return {ok: false, error: "Store not found"};}

            if (!store || store.id !== storeId) {return {ok: false, error: "Store mismatch"};}
        } 

        const orderData = await getOrderAPI(storeId, orderId, normalizedEmail);

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

        revalidateTag('orders', 'max');
        
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
            query: "SELECT * FROM c WHERE c.status = 'paid'"
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

