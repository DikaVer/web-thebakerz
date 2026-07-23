/**
 * @fileoverview Client wrapper that prepares product data for the bakery product editor.
 *
 * Exports ItemAddView, which strips identifying fields (id, name, pictures)
 * from an existing ProductData to produce a ProductDataClean template and
 * renders BakerzProductView for the current store from the store provider.
 */
'use client';
import React from 'react';
import { useStore } from '@/components/providers/store-provider';
import { ProductData, ProductDataClean } from '@/lib/actions/product';
import BakerzProductView from "@/components/store/product-page/products-bakerz-view";

interface ItemAddViewProps {
    productData: ProductData | null;
}

export const ItemAddView: React.FC<ItemAddViewProps> = ({
    productData
}) => {
    const { store } = useStore();

    let cleanProductData: ProductDataClean | undefined;

    if (productData) {
        cleanProductData = {
            ...productData,
            id: undefined,
            name: undefined,
            picture: undefined,
            additionalImages: undefined,

        };
    }


    return (
        <BakerzProductView
            storeId={store.id}
            productData={cleanProductData}
        />
    );
};