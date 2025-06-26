'use server';

import React from "react";
import { ProductListBase } from "@/components/store/product/product-list";
import { getProductsOrderAPI } from "@/lib/api/GET/products-api";
import { getStoreScheduleAPI } from "@/lib/api/GET/store-api";
import { getRescueDeal, RescueDeal } from "@/lib/actions/rescue-deal";
import { isWithinClosingWindow } from "@/lib/utils/helper/schedule-utils";
import { checkInventoryAvailability } from "@/lib/utils/helper/check-inventory-rescue";

type SearchParams = {
    minPrice?: string;
    maxPrice?: string;
    categories?: string;
    allergies?: string;
    dietary?: string;
};

export const ProductComponentBase: React.FC<{ storeId: string, searchParams?: SearchParams }> = async ({ storeId, searchParams = {} }) => {

    // Fetch product order
    const productsOrder = await getProductsOrderAPI(storeId);

    const schedule = await getStoreScheduleAPI(storeId);

    // Check if current time is within 45 minutes of closing
    const isClosingSoon = isWithinClosingWindow(schedule);

    let rescueDeals: RescueDeal | null = null;

    if(isClosingSoon){
        rescueDeals = await getRescueDeal(storeId);
        //update rescue deal with available quantity
        if(rescueDeals){
            const newQuantities = await checkInventoryAvailability(rescueDeals.products?.map(p => p.id) || [], storeId);    
            rescueDeals.products?.forEach(p => {
                p.quantity = newQuantities[p.id] || 0;
            });
            // Filter to only show selected rescue deal products
            rescueDeals.products = rescueDeals.products?.filter(p => p.isSelected === true);
        }
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