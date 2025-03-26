import React from "react";
import { ProductListBase } from "@/components/store/product/product-list";
import {getCurrentProducts, ProductData, ProductDataFull} from "@/lib/actions/product";
import {getCurrentProductsOrder} from "@/lib/actions/order-products";
import {sortItems} from "@/lib/helper/sort-items-with-order";
import {getTranslations} from "next-intl/server";

export const ProductComponentBase: React.FC<{ storeId: string }> = async ({ storeId }) => {
    const productsData: ProductDataFull = await getCurrentProducts(storeId);
    const t = await getTranslations("app/(store)/[id]/page");

    const productsOrder = await getCurrentProductsOrder(storeId);

    if (productsData === null || Object.keys(productsData).length === 0) {
        return (
            <div className="text-center">
                <p className="text-2xl my-10">{t("noProducts")}</p>
            </div>
        );
    }

    // Convert the object to an array before categorizing
    const productsArray: ProductData[] = Object.values(productsData);

    // Categorize products by their category using a Record type
    const productsByCategories: Record<string, ProductData[]> = productsArray.reduce((acc, product) => {
        if (!acc[product.category]) {
            acc[product.category] = [];
        }
        acc[product.category].push(product);
        return acc;
    }, {} as Record<string, ProductData[]>);

    // console.log(productsByCategories)

    Object.keys(productsOrder).forEach((category) => {
        const orderForCategory: string[] = productsOrder[category] || [];
        if(productsByCategories[category]) {
            productsByCategories[category] = sortItems<ProductData>(
                productsByCategories[category],
                orderForCategory,
                (product) => product.constId,
                (a, b) => a.name.localeCompare(b.name)
            );
        }
    });

    const categories = sortItems(
        Object.keys(productsByCategories),
        Object.keys(productsOrder),
        (category) => category,
        (a, b) => a.localeCompare(b)
    )

    return (
        <ProductListBase
            categories={categories}
            productsData={productsData}
            productsByCategories={productsByCategories}
        />
    );
};