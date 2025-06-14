import React from "react";

import { ProductDataFull} from "@/lib/actions/product";
import { getCurrentProducts } from "@/lib/api/products-api";
import {getTranslations} from "next-intl/server";
import {ProductView} from "@/components/store/product-page/product-view";
import { getStoreDataByStoreNameOrId } from "@/lib/actions/store";
import { isWithinClosingWindow } from "@/lib/utils/helper/schedule-utils";
import { getRescueDeal, RescueDeal } from "@/lib/actions/rescue-deal";

export const ProductPage: React.FC<{ storeId: string, productId: string }> = async ({ storeId, productId }) => {
    const productsData: ProductDataFull = await getCurrentProducts(storeId);
    const t = await getTranslations("app/(store)/components/product-page");

    if (productsData === null || Object.keys(productsData).length === 0) {
        return (
            <div className="text-center">
                <p className="text-2xl my-10">{t("noProductsAvailable")}</p>
            </div>
        );
    }

    // Get store data to check schedule
    const store = await getStoreDataByStoreNameOrId(storeId);
    const schedule = store?.schedule;

    // Check if current time is within 45 minutes of closing
    const isClosingSoon = isWithinClosingWindow(schedule);

    let rescueDeals: RescueDeal | null = null;

    if(isClosingSoon){
        rescueDeals = await getRescueDeal(storeId);
    }

    return (
        <ProductView
            productsData={productsData}
            productId={productId}
            rescueDeals={rescueDeals}
        />
    );
};