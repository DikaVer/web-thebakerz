'use server';

import {globalPOSTRateLimit} from "@/lib/actions/requests";
import {getCurrentSession} from "@/lib/actions/session";
import {containerProductsOrder} from "@/db";
import {revalidateTag} from "next/cache";
import {ProductDataFull} from "@/lib/actions/product";

export const updateProductsOrder = async (
    orderData: Record<string, string[]>,
) => {
    if (!(await globalPOSTRateLimit())) {
        return { error: "Too many requests" };
    }

    const { user, store } = await getCurrentSession();
    if (!user || !store) {
        return { error: "User not found!" };
    }

    // Fetch the old product data if updating
    const productsOrderData = {
        id: store.id,
        store_id: store.id,
        order: orderData,
        updatedAt: new Date().toISOString(),
    }

    try {


        await containerProductsOrder.items.upsert(productsOrderData);
        revalidateTag('productsOrder');
        return { success: "Order updated!"};

    } catch (error: any) {
        console.error("Error updating product:", error);
        return { error: "Failed to update product." };
    }
};

export const getProductsOrder = async (storeId: string): Promise<Record<string, string[]>> => {
    try {
        if (!storeId) {
            return {};
        }

        const { resource: productsOrder } = await containerProductsOrder
            .item(storeId, storeId)
            .read();

        return productsOrder?.order || {};
    } catch (error) {
        console.error("Error fetching products order:", error);
        return {};
    }
};

export async function getCurrentProductsOrder(storeId: string): Promise<Record<string, string[]>> {
    try {

        if (!storeId) {
            return {};
        }

        return await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/store/products-order`, {
            headers: {
                'Store-Id': storeId,
            },
            next: {
                tags: ['productsOrder'],
                revalidate: 300
            }
        }).then(res => res.json());

    } catch (error) {
        console.error("Error fetching store products:", error);
        throw new Error("Failed to fetch store products");
    }
}