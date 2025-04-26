'use server';

import { getAllOrdersAdmin, OrderData } from "@/lib/actions/order";
import { getCurrentSession } from "@/lib/actions/session";
import { getTranslations } from "next-intl/server";

export interface OverviewData {
    totalAmountProcessed: number;
    completedOrdersCount: number;
    nonCompletedOrdersCount: number;
    totalOrdersCount: number;
    allOrders: OrderData[];
    error?: string;
}

type TranslationFunction = (key: string, params?: Record<string, string | number>) => string;

/**
 * Fetches and processes data needed for the admin overview dashboard.
 *
 * @returns {Promise<OverviewData>} An object containing aggregated data and all orders.
 */
export async function getOverviewData(): Promise<OverviewData> {

    try {
        const { user } = await getCurrentSession();
        if (!user) {
            return { 
                error: "Session expired",
                totalAmountProcessed: 0,
                completedOrdersCount: 0,
                nonCompletedOrdersCount: 0,
                totalOrdersCount: 0,
                allOrders: []
            };
        }

        if (user.role !== "admin") {
             return { 
                error: "Not authorized",
                totalAmountProcessed: 0,
                completedOrdersCount: 0,
                nonCompletedOrdersCount: 0,
                totalOrdersCount: 0,
                allOrders: []
            };
        }

        const allOrders = await getAllOrdersAdmin();

        let totalAmountProcessed = 0;
        let completedOrdersCount = 0;
        let nonCompletedOrdersCount = 0;

        allOrders.forEach(order => {
            // Sum total amount only for 'paid' orders to represent processed money
            // Or adjust this logic based on how 'processed' is defined (e.g., include 'manual' if they represent cash payments)
            if (order.status === 'paid') {
                totalAmountProcessed += order.priceData?.totalInclVat || 0;
            }

            if (order.order_status === 'completed') {
                completedOrdersCount++;
            } else if (order.order_status !== 'cancelled' && order.order_status !== 'refunded') {
                // Count non-completed, excluding cancelled/refunded
                nonCompletedOrdersCount++;
            }
        });

        return {
            totalAmountProcessed,
            completedOrdersCount,
            nonCompletedOrdersCount,
            totalOrdersCount: allOrders.length, // Or perhaps filter out cancelled/refunded here too?
            allOrders
        };

    } catch (error) {
        console.error("Error getting overview data:", error);
        return { 
            error: "Fetch failed",
            totalAmountProcessed: 0,
            completedOrdersCount: 0,
            nonCompletedOrdersCount: 0,
            totalOrdersCount: 0,
            allOrders: []
         };
    }
} 