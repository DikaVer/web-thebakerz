/**
 * @fileoverview Server component for the store's add/edit item page.
 *
 * Exports ItemPage, an async component that fetches an existing product by
 * store and product id (unless the id is "new") and passes it to ItemAddView
 * for editing or creation.
 */
import React from "react";

import {ProductData} from "@/lib/actions/product";
import {ItemAddView} from "@/components/store/add-item/item-add-view";
import { getProductByStoreIdAndProductIdAPI } from "@/lib/api/GET/products-api";
export const ItemPage: React.FC<{ storeId: string, productId: string }> = async ({ storeId, productId }) => {

    let productData: ProductData | null = null;
    
    if (productId !== "new") {      
        productData = await getProductByStoreIdAndProductIdAPI(storeId, productId);
    }

    return (
        <ItemAddView
            productData={productData}
        />
    );
};