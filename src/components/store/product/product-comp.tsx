'use server';

import React from "react";
import { ProductListBase } from "@/components/store/product/product-list";
import { ProductDataFull } from "@/lib/actions/product";
import { getCurrentProducts } from "@/lib/api/products-api";
import { getCurrentProductsOrder } from "@/lib/actions/order-products";
import { getTranslations } from "next-intl/server";

type SearchParams = {
    minPrice?: string;
    maxPrice?: string;
    categories?: string;
    allergies?: string;
    dietary?: string;
};

export const ProductComponentBase: React.FC<{ storeId: string, searchParams?: SearchParams }> = async ({ storeId, searchParams = {} }) => {
    const t = await getTranslations("app/(store)/id/page");

    // Fetch all products (unfiltered)
    const productsData: ProductDataFull = await getCurrentProducts(storeId);

    // Fetch product order
    const productsOrder = await getCurrentProductsOrder(storeId);

    if (productsData === null || Object.keys(productsData).length === 0) {
        return (
            <div className="text-center">
                <p className="text-2xl my-10">{t("noProducts")}</p>
            </div>
        );
    }


    return (
        <>
            <ProductListBase
                productsOrder={productsOrder}
                productsData={productsData}
            />
        </>
    );
};