/**
 * @fileoverview Server action that aggregates order data for the admin overview dashboard.
 *
 * Exports getOverviewData, which fetches all orders via getAllOrdersAdmin and
 * computes the total amount processed for paid orders plus counts of completed,
 * non-completed (excluding cancelled/refunded), and total orders. Returns the
 * aggregates together with the raw order list, or zeroed values with an error
 * string on failure.
 */
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