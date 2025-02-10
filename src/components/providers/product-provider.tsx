'use client';

import React, { createContext, useState, useContext, ReactNode } from 'react';
import { CartItem, ProductDataField, StoreData } from '@/lib/definitions';
import { ProductDescriptionBakerz, ProductDescriptionUser } from '@/components/store/product/product-description';
import ProductsAdd from "@/components/store/product/products-add";

interface ProductDialogContextProps {
    openProductDialogStore: (product: ProductDataField) => void;
    closeProductDialog: () => void;
    openProductDialogBakerz: (
        product: ProductDataField,
        isPending: boolean,
        setPending: (isPending: boolean) => void,
        setStoreData: (data: StoreData) => void
    ) => void;
}

const ProductDialogContext = createContext<ProductDialogContextProps | undefined>(undefined);

type ActiveDialog = 'user' | 'bakerz' | null;

export const ProductDialogProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    // A single state to track which dialog is active.
    const [activeDialog, setActiveDialog] = useState<ActiveDialog>(null);
    const [productData, setProductData] = useState<ProductDataField | undefined>();
    const [editCartData, setEditCartData] = useState<{ quantity: number; uniqueId: string } | undefined>();

    // Group Bakerz-specific data together.
    const [bakerzData, setBakerzData] = useState<{
        isPending: boolean;
        setPending: (isPending: boolean) => void;
        setStoreData: (data: StoreData) => void;
    } | null>(null);

    const closeProductDialog = () => {
        setActiveDialog(null);
        setProductData(undefined);
        setEditCartData(undefined);
        setBakerzData(null);
    };

    const openProductDialogStore = (product: ProductDataField) => {
        closeProductDialog();
        setProductData(product);
        setActiveDialog('user');
    };


    const openProductDialogBakerz = (
        product: ProductDataField,
        isPending: boolean,
        setPending: (isPending: boolean) => void,
        setStoreData: (data: StoreData) => void
    ) => {
        closeProductDialog();
        setProductData(product);
        setBakerzData({ isPending, setPending, setStoreData });
        setActiveDialog('bakerz');
    };


    return (
        <ProductDialogContext.Provider
            value={{
                openProductDialogStore,
                closeProductDialog,
                openProductDialogBakerz
            }}
        >
            {children}
            {activeDialog === 'user' && productData && (
                <ProductDescriptionUser
                    isDialogOpen={true}
                    setDialogOpen={(open) => { if (!open) closeProductDialog(); }}
                    productData={productData}
                    editCartData={editCartData}
                />
            )}
            {activeDialog === 'bakerz' && productData && (
                <ProductDescriptionBakerz
                    isDialogOpen={true}
                    setDialogOpen={(open) => { if (!open) closeProductDialog(); }}
                    productData={productData}
                />
            )}
        </ProductDialogContext.Provider>
    );
};

export const useProductDialog = () => {
    const context = useContext(ProductDialogContext);
    if (!context) {
        throw new Error('useProductDialog must be used within a ProductDialogProvider');
    }
    return context;
};
