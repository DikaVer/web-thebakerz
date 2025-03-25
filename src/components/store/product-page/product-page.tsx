import React from "react";

import {getCurrentProducts, ProductDataFull} from "@/lib/actions/product";
import {getTranslations} from "next-intl/server";
import {ProductView} from "@/components/store/product-page/product-view";

export const ProductPage: React.FC<{ storeId: string, productId: string }> = async ({ storeId, productId }) => {
    const productsData: ProductDataFull = await getCurrentProducts(storeId);
    const t = await getTranslations("TheBakerz");

    if (productsData === null || Object.keys(productsData).length === 0) {
        return (
            <div className="text-center">
                <p className="text-2xl my-10">{t("No Products Available")}</p>
            </div>
        );
    }


    return (
        <ProductView
            productsData={productsData}
            productId={productId}
        />
    );
};