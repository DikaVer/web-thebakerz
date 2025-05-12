'use server';

import { getCurrentSession } from "@/lib/actions/session";
import { OrderData } from "@/lib/actions/order";
import { getTranslations } from "next-intl/server";

/**
 * Fetches orders for the current user.
 * 
 * @returns {Promise<OrderData[]>} A promise that resolves to an array of user orders.
 */
export async function getUserOrders(): Promise<OrderData[]> {
    const t = await getTranslations("app/lib/actions/user-orders");
    
    try {
        const { user } = await getCurrentSession();
        if (!user) {
            return [];
        }

        // Fetch user orders from the API
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/user/orders`, {
            headers: {
                'Email': user.email,
                'Authorization': `Bearer ${process.env.NEXT_PRIVATE_SECRET_BEARER}`,
            },
            next: {
                tags: ['orders'],
                revalidate: 0 // Don't cache this data to ensure it's always fresh
            }
        });

        if (!response.ok) {
            throw new Error(t("failedFetchOrders"));
        }

        return response.json();
    } catch (error) {
        console.error("Error fetching user orders:", error);
        return [];
    }
}

/**
 * Fetches a specific order for the current user.
 * 
 * @param {string} storeId - The store ID
 * @param {string} orderId - The order ID
 * @returns {Promise<OrderData | null>} A promise that resolves to the order data or null if not found.
 */
export async function getUserOrder(storeId: string, orderId: string): Promise<OrderData | null> {
    const t = await getTranslations("app/lib/actions/user-orders");
    
    try {
        const { user } = await getCurrentSession();
        if (!user) {
            return null;
        }

        // Fetch the specific order from the API
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/store/order`, {
            headers: {
                'Store-Id': storeId,
                'Order-Id': orderId,
                'Email': user.email,
                'Authorization': `Bearer ${process.env.NEXT_PRIVATE_SECRET_BEARER}`,
            },
            next: {
                tags: ['orders'],
                revalidate: 300
            }
        });

        if (!response.ok) {
            return null;
        }

        return response.json();
    } catch (error) {
        console.error("Error fetching user order:", error);
        return null;
    }
} 