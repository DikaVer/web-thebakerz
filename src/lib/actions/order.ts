'use server';
import * as z from "zod";
import {CustomerOrderSchema} from "@/lib/schemas";
import {globalPOSTRateLimit} from "@/lib/actions/requests";
import {getCartSessionCookieOrCreate, getCurrentSession} from "@/lib/actions/session";
import {getCart, removeCartByUserIdAndStoreId} from "@/lib/actions/cart";
import {getOrderTime} from "@/app/(store)/[id]/actions";
import {getProductsByStoreId} from "@/lib/actions/product";
import {connectionPool, containerOrders} from "@/db";
import {sendOrderPlaced} from "@/lib/emailSendRequest";
import {revalidateTag} from "next/cache";
import {v4 as uuidv4} from "uuid";
import {calculateTax} from "@/lib/utils";
import Stripe from "stripe";

// Order data interface
export interface OrderData {
    id: string;
    store_order_id: string;
    store_id: string;
    customer_email: string;
    customer: Customer;
    createdAt: Date;
    amount: number;
    sub_amount: number;
    status: "paid" | "manual" ;
    scheduled_time: {
        date: string;
        time: string;
    };
    order_status: OrderStatus;
    completed: boolean;
    productsData: OrderProducts;
    amount_tax: number;
    cancelledAt?: Date;
    refundedAt?: Date;
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
    phone_number?: string;
    address: Stripe.Address | null;
}

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

    // //Check if data is tommorow
    // Check if order date is not in the past
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Reset time to start of day
    const orderDateObj = new Date(date);
    orderDateObj.setHours(0, 0, 0, 0); // Reset time to start of day

    if (orderDateObj < today) {
        return {error: 'Cannot place orders for past dates'};
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

        const tax = calculateTax(subtotal);
        const sub_amount = subtotal - tax;

        // 2. Create an order record in Azure Cosmos DB
        const orderData: OrderData = {
            id: cosmosId,
            store_order_id: result.rows[0].store_order_id,
            store_id: store.id,
            customer_email: formData.email,
            customer: {
                email_customer: formData.email,
                email_verified: false,
                name_customer: formData.name,
                phone_number: formData.phoneNumber,
                address: null
            },
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
            amount_tax: tax,
            sub_amount: sub_amount

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

export async function getOrdersByDateRange(storeId: string, fromDate: string, toDate: string): Promise<OrderData[]> {
    try {
        const {store} = await getCurrentSession();
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
            throw new Error(`Failed to fetch orders: ${response.status}`);
        }

        return response.json();
    } catch (error) {
        console.error("Error fetching orders by date range:", error);
        return [];
    }
}


export async function updateOrderStatus(storeId: string, orderId: string, email: string, status: string): Promise<boolean> {
    try {
        const {store} = await getCurrentSession();
        if (!store || store.id !== storeId) {return false;}
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/store/order/updateStatus`, {
            method: 'POST',
            headers: {
                'Store-Id': storeId,
                'Order-Id': orderId,
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
    try {
        if (!storeId || !orderId || !email) {return null;}
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
            revalidate: 300
        }
    }).then(res => res.json());
};