import React from "react";
import { ProductListBase } from "@/components/store/product/product-list";
import {getCurrentProducts, ProductData, ProductDataFull} from "@/lib/actions/product";

export const ProductComponentBase: React.FC<{ storeId: string }> = async ({ storeId }) => {
    const productsData: ProductDataFull = await getCurrentProducts(storeId);

    if (productsData === null || Object.keys(productsData).length === 0) {
        return (
            <div className="text-center">
                <p className="text-2xl my-10">Store does not have any products yet.</p>
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

    return (
        <ProductListBase
            productsData={productsData}
            productsByCategories={productsByCategories}
        />
    );
};
