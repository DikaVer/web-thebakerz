import { NextResponse } from 'next/server';
import {getOrder} from "@/lib/actions/order";
import {connectionPool, containerOrders} from "@/db";
import {getCurrentSession} from "@/lib/actions/session";
import {revalidateTag} from "next/cache";

// This array defines the valid progression order.
const validStatusOrder = ['cancelled', 'refunded', "new", "started", "ready", "completed"];

// This function updates the status of an order in the database.
async function updateOrderInCosmos(storeId: string, orderId: string, email: string, newStatus: string) {
    try {

        const partitionKeyValue = [storeId, email];
        // Example Cosmos DB update operation
        await containerOrders.item(orderId, partitionKeyValue).patch({
            operations: [
                { op: 'replace', path: '/order_status', value: newStatus },
                { op: 'set', path: `/${newStatus}_at`, value: newStatus },
            ]
        });

        // console.log(`Updated order ${orderId} status to ${newStatus} in Cosmos DB`);
    } catch (error) {
        console.error('Error updating order in Cosmos DB:', error);
        throw new Error('Failed to update order in Cosmos DB');
    }
}

async function updateOrderInPostgreSQL(storeId: string, orderId: string, email: string) {
    try {
        const result = await connectionPool.query(
            `UPDATE payment_orders 
             SET completed = $1
             WHERE cosmos_id = $2 AND store_id = $3 AND email_customer = $4
             RETURNING id`,
            [true, orderId, storeId, email]
        );

        if (result.rows.length === 0) {
            throw new Error('Order not found or update failed');
        }

        // console.log(`Updated order ${orderId} status to in PostgreSQL`);
    } catch (error) {
        console.error('Error updating order in PostgreSQL:', error);
        throw new Error('Failed to update order in PostgreSQL');
    }
}

// This API route accepts GET requests with a Bearer token in the Authorization header.
export async function POST(request: Request) {
    // Retrieve the Authorization header
    const storeId = request.headers.get('Store-Id');
    if (!storeId) {
        return NextResponse.json(
            { error: 'Missing or invalid Store-Id header' },
            { status: 401 }
        );
    }

    const orderId = request.headers.get('Order-Id');
    if (!orderId) {
        return NextResponse.json(
            { error: 'Missing or invalid Order-Id header' },
            { status: 401 }
        );
    }

    const email = request.headers.get('Email');
    if (!email) {
        return NextResponse.json(
            { error: 'Missing or invalid User-Id header' },
            { status: 401 }
        );
    }

    const status = request.headers.get('Status');
    if (!status) {
        return NextResponse.json(
            { error: 'Missing or invalid Status header' },
            { status: 401 }
        );
    }

    const authHeader = request.headers.get('Authorization');
    if (!authHeader) {
        return NextResponse.json(
            { error: 'Missing or invalid Authorization header' },
            { status: 401 }
        );
    }

    const token = authHeader.replace('Bearer ', '').trim();
    if (token !== process.env.NEXT_PRIVATE_SECRET_BEARER) {
        return NextResponse.json(
            { error: 'Not Authorize Access' },
            { status: 401 }
        );
    }

    try {

        const orderData = await getOrder(storeId, orderId, email);

        if (!orderData) {
            return NextResponse.json(
                { error: 'Order not found' },
                { status: 404 }
            );
        }

        if (orderData.id !== orderId || orderData.store_id !== storeId || orderData.customer_email !== email) {
            return NextResponse.json(
                { error: 'Invalid Data' },
                { status: 401 }
            );
        }

        const newStatus = status.toLowerCase();
        // const currentIndex = validStatusOrder.indexOf(orderData.order_status);
        const newIndex = validStatusOrder.indexOf(newStatus);

        if (newIndex === -1) {
            return NextResponse.json(
                { error: 'Invalid Status' },
                { status: 400 }
            );
        }
        // console.log(currentIndex, newIndex);
        //
        // if (newIndex <= currentIndex) {
        //     return NextResponse.json(
        //         { error: 'Invalid Status' },
        //         { status: 400 }
        //     );
        // }

        if (newStatus === "completed") {
            await updateOrderInPostgreSQL(storeId, orderId, email);
            await updateOrderInCosmos(storeId, orderId, email, newStatus);
        } else {
            await updateOrderInCosmos(storeId, orderId, email, newStatus);
        }



        revalidateTag('orders');
        return NextResponse.json(orderData, {status: 200 });
    } catch (error) {
        console.error('Error validating session:', error);
        return NextResponse.json(
            { error: 'Internal Server Error' },
            { status: 500 }
        );
    }
}
