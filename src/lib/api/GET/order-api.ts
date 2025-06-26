'use server';

import { getOrdersAdminByDateRange, OrderData } from "../../actions/order";
import { getTranslations } from "next-intl/server";
import { getCurrentSession } from "../../actions/session";

export const getOrderAPI = async (storeId: string, orderId: string, email: string): Promise<OrderData> => {
    return await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/store/order/${storeId}/${orderId}/${email}`, {
        headers: {
            'Authorization': `Bearer ${process.env.NEXT_PRIVATE_SECRET_BEARER}`,
        },
        next: {
            tags: ['orders'],
            revalidate: 300
        }
    }).then(res => res.json());
};


export async function getOrdersByDateRange(storeId: string, fromDate: string, toDate: string): Promise<OrderData[]> {
    const t = await getTranslations("app/lib/actions/order");
    
    try {
        const {user, stores} = await getCurrentSession();
        if (!user) {return [];}

        if (user.role === "admin") {
            return await getOrdersAdminByDateRange(fromDate, toDate);
        }

        const store = stores?.find(store => store.id === storeId);
        if (!store) {return [];}

        const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/store/order/${storeId}/range`, {
            headers: {
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