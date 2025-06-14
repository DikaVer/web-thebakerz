'use server';

import React from "react";
import { ProductListBase } from "@/components/store/product/product-list";
import { getCurrentProductsOrder } from "@/lib/api/products-api";
import { getCurrentStoreSchedule } from "@/lib/api/store-api";
import { getRescueDeal, RescueDeal } from "@/lib/actions/rescue-deal";
import { isWithinClosingWindow } from "@/lib/utils/helper/schedule-utils";

type SearchParams = {
    minPrice?: string;
    maxPrice?: string;
    categories?: string;
    allergies?: string;
    dietary?: string;
};

export const ProductComponentBase: React.FC<{ storeId: string, searchParams?: SearchParams }> = async ({ storeId, searchParams = {} }) => {

    // Fetch product order
    const productsOrder = await getCurrentProductsOrder(storeId);

    const schedule = await getCurrentStoreSchedule(storeId);

    // Check if current time is within 45 minutes of closing
    const isClosingSoon = isWithinClosingWindow(schedule);

    let rescueDeals: RescueDeal | null = null;

    if(false){
        rescueDeals = await getRescueDeal(storeId);
    }

    return (
        <>
            <ProductListBase
                rescueDeals={rescueDeals}
                productsOrder={productsOrder}
            />
        </>
    );
};