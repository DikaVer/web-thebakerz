'use server';
import * as z from "zod";
import {CustomerOrderSchema} from "@/lib/schemas";
import {globalPOSTRateLimit} from "@/lib/actions/requests";
import {headers} from "next/headers";
import {getCartSessionCookieOrCreate, getCurrentSession} from "@/lib/actions/session";
import {getCart, removeCartByUserIdAndStoreId} from "@/lib/actions/cart";
import {getOrderTime} from "@/app/(store)/[id]/actions";
import {getProductsByStoreId, ProductData, ProductDataFull} from "@/lib/actions/product";
import {stripe} from "@/stripe";
import {connectionPool, containerOrders, containerProducts} from "@/db";
import {NextResponse} from "next/server";
import {sendOrderPlaced} from "@/lib/emailSendRequest";
import {revalidateTag} from "next/cache";
import {getScheduleById, WorkHours} from "@/lib/actions/calendar-actions";
import {StoreData} from "@/lib/actions/store";
import {v4 as uuidv4} from "uuid";

// Order data interface
export interface OrderData {
    id: string;
    order_id: string;
    store_id: string;
    email_customer: string;
    createdAt: Date;
    amount: number;
    status: "paid" | "manual" ;
    scheduled_time: {
        date: string;
        time: string;
    };
    order_status: "new" | "started" | "ready" | "completed" | "cancelled";
    completed: boolean;
    productsData: OrderProducts;
    amount_tax: number;
    cancelledAt?: Date;
}

export type OrderProducts = Array<OrderProduct>;

export type OrderProduct = {
    id: string;
    name: string;
    variants: string[];
    qty: number;
    price: number;
    const_id: string;
    ingredients: string[] | undefined;
    allergies: string[] | undefined;
}

export const createOrder = async (
    formData: z.infer<typeof CustomerOrderSchema>
):Promise<{error?: string; orderId?: string}> => {
    if (!(await globalPOSTRateLimit())) {
        return {
            error: "Too many requests"
        };
    }

    // Validate the form data
    const validation = CustomerOrderSchema.safeParse(formData);
    if (!validation.success) {
        return { error: "Invalid fields!" };
    }

    const { session, user, store} = await getCurrentSession();
    let userId;
    if (!session || !user) {
        userId = await getCartSessionCookieOrCreate();
    } else {
        userId = user.id;
    }

    if(!store){
        return { error: "Store not found!" };
    }

    if (!userId) return { error: "User not found!" };

    const cartData = await getCart(userId, store.id);

    // Check if cart has items
    if (!cartData || !cartData[store.id] || Object.keys(cartData[store.id]).length === 0) {
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
    const productsData = await getProductsByStoreId(store.id);

    // Create line items from cart
    const cartItems = [];
    let subtotal = 0;

    for (const itemId in cartData[store.id]) {
        const cartItem = cartData[store.id][itemId];
        const product = productsData[cartItem.product_id];

        if (!product) {
            continue; // Skip if product not found
        }

        const unitAmount = product.price; // Assuming price is stored in cents
        subtotal += unitAmount * cartItem.quantity;

        cartItems.push({
            id: product.id,
            name: product.name,
            qty: cartItem.quantity,
            price: product.price,
            variants: cartItem.note ? [cartItem.note] : [],
            const_id: product.constId,
            ingredients: product.ingredients,
            allergies: product.allergies
        });
    }

    try {

        const cosmosId = uuidv4();

        // 1. Create an order record in PostgreSQL
        const result = await connectionPool.query(
            `
                    INSERT INTO payment_orders
                    (store_id, store_order_id, email_customer, amount, product_ids, status, cosmos_id)
                    VALUES
                        (
                            $1,
                            (SELECT COALESCE(COUNT(*) + 1, 1) FROM payment_orders WHERE store_id = $7),
                            $2,
                            $3,
                            $4::text[],
                            $5,
                            $6
                        )
                        RETURNING order_date, store_order_id
                `,
            [
                store.id,
                formData.email,
                subtotal,
                cartItems?.map(item => item.id || 'Error'), // Pass as native array for text[] column
                "manual",
                cosmosId,
                store.id  // Added storeId again as parameter $7 for the subquery
            ]
        );


        if (result.rows.length === 0) {
            return {error: 'Failed to create order'};
        }

        // 2. Create an order record in Azure Cosmos DB
        const orderData: OrderData = {
            id: cosmosId,
            order_id: result.rows[0].store_order_id,
            store_id: store.id,
            email_customer: formData.email,
            createdAt: result.rows[0].order_date,
            amount: subtotal,
            status: "manual",
            scheduled_time: {
                date: date,
                time: time
            },
            order_status: 'new',
            completed: false,
            productsData: cartItems,
            amount_tax: subtotal * 21/121,

        }

        await containerOrders.items.create(orderData);

        await removeCartByUserIdAndStoreId(userId, store.id);

        // 3. Send confirmation email
        sendOrderPlaced({
            orderData: orderData,
            identifier: formData.email,
        })
        revalidateTag('orders');


        return {
            orderId: cosmosId
        }
    } catch (error) {
        console.error('Error creating checkout session:', error);
        return { error: 'Failed to create checkout session' };
    }
};

export async function getOrder(storeId: string, orderId: string, email: string): Promise<OrderData | null> {
    try {


        if (!storeId || !orderId || !email) {
            return null;
        }

        const partitionKeyValue = [storeId, email];

        const { resource: order } = await containerOrders.item(orderId, partitionKeyValue).read();

        return order ? order : null;
    } catch (error) {
        console.error("Error fetching store data:", error);
        throw new Error("Failed to fetch store data");
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
            revalidate: 0
        }
    }).then(res => res.json());
};