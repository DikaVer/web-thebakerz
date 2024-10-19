import React from "react";
import {ProductList} from "@/components/user/product-list";
import {ProductData, ProductDataField} from "@/lib/definitions";


export function ProductComponentUser({id, productData}: {
    id: string,
    productData: ProductData,
}) {

    if (productData.length === 0) {
        return (
            <div className="text-center">
                <p className={"text-2xl my-10"}>You do not have any products yet.</p>
            </div>
        );
    } else {

        const productsByCategory: { [key: string]: ProductDataField[] } = {};

        productData.forEach(product => {
            if (!productsByCategory[product.category]) {
                productsByCategory[product.category] = [];
            }
            productsByCategory[product.category].push(product);
        });

        return <ProductList
            id={id}
            productsByCategories={productsByCategory}
        />;
    }
}