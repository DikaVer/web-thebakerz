import React, { useMemo } from "react";
import {ProductListBase} from "@/components/store/product/product-list";
import {useStore} from "@/components/providers/store-provider";
import {getProductsByStoreName, ProductData} from "@/lib/actions/product";





export const ProductComponentBase: React.FC<{ storeName: string }> = async ({ storeName }) => {


    const productsData = await getProductsByStoreName(storeName);

    if (!productsData) {
        return (
            <div className="text-center">
                <p className="text-2xl my-10">Store does not have any products yet.</p>
            </div>
        );
    }

    // Categorize products by their category
    const productsByCategory: { [key: string]: ProductData[] } = productsData.reduce((acc, product) => {
        if (!acc[product.category]) {
            acc[product.category] = [];
        }
        acc[product.category].push(product);
        return acc;
    }, {} as { [key: string]: ProductData[] });


    return (
        <ProductListBase
            productsData={productsData}
            productsByCategories={productsByCategory}
        />
    );
};




