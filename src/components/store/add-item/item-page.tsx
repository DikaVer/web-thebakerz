import React from "react";

import {getCurrentProduct, ProductData} from "@/lib/actions/product";
import {getTranslations} from "next-intl/server";
import {ProductView} from "@/components/store/product-page/product-view";
import {ItemAddView} from "@/components/store/add-item/item-add-view";
export const ItemPage: React.FC<{ storeId: string, productId: string }> = async ({ storeId, productId }) => {

    let productData: ProductData | null = null;
    
    if (productId !== "new") {      
        productData = await getCurrentProduct(storeId, productId);
    }

    return (
        <ItemAddView
            productData={productData}
        />
    );
};