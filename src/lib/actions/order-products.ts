'use server';

import {globalPOSTRateLimit} from "@/lib/utils/helper/requests";
import {getCurrentSession} from "@/lib/actions/session";
import {containerProductsOrder} from "@/db";
import {revalidateTag} from "next/cache";
import { getTranslations } from "next-intl/server";
import {getStoreByUserIdAndStoreIdAPI} from "@/lib/api/GET/store-api";

type TranslationFunction = (key: string, params?: Record<string, string | number>) => string;

export const updateProductsOrder = async (
    storeId: string,
    orderData: Record<string, string[]>,
) => {
    const t = await getTranslations("app/lib/actions/order-products") as TranslationFunction;
    
    if (!(await globalPOSTRateLimit())) {
        return { error: t("tooManyRequests") };
    }

    const { user} = await getCurrentSession();
    if (!user) {
        return { error: t("userNotFound") };
    }

    const { store } = await getStoreByUserIdAndStoreIdAPI(user.id, storeId);
    if (!store) {
        return { error: t("storeNotFound") };
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
        return { success: t("orderUpdated")};
    } catch (error: any) {
        console.error("Error updating product:", error);
        return { error: t("failedUpdateProduct") };
    }
};

export const getProductsOrder = async (storeId: string): Promise<Record<string, string[]>> => {
    const t = await getTranslations("app/lib/actions/order-products") as TranslationFunction;
    
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
