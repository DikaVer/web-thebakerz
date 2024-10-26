'use client';

import React, { createContext, useState, useContext, ReactNode } from 'react';
import {CartItem, ProductDataField, StoreData} from '@/lib/definitions';
import {ProductDescriptionBakerz, ProductDescriptionUser} from '@/components/store/product/product-description';
import ProductsAdd from "@/components/store/product/products-add";

interface ProductDialogContextProps {
    openProductDialogCart: (product: CartItem) => void;
    openProductDialogStore: (product: ProductDataField) => void;
    closeProductDialog: () => void;
    openProductDialogBakerz: (product: ProductDataField, isPending: boolean, setPending: (isPending: boolean) => void, setStoreData: (data: StoreData) => void) => void;
    editProductDialogBakerz: (product: ProductDataField, isPending: boolean, setPending: (isPending: boolean) => void, setStoreData: (data: StoreData) => void) => void;
}

const ProductDialogContext = createContext<ProductDialogContextProps | undefined>(undefined);

export const ProductDialogProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [isDialogUserOpen, setDialogUserOpen] = useState(false);
    const [isDialogBakerzOpen, setDialogBakerzOpen] = useState(false);
    const [isDialogBakerzEditOpen, setDialogBakerzEditOpen] = useState(false);
    const [isPending, setIsPending] = useState<boolean | undefined>(undefined);
    const [setPending, setSetPending] = useState<((isPending: boolean) => void) | undefined>(undefined);
    const [setStoreData, setSetStoreData] = useState<((data: StoreData) => void) | undefined>(undefined);
    const [productData, setProductData] = useState<ProductDataField | undefined>();
    const [editCartData, setEditCartData] = useState<{
        quantity: number;
        uniqueId: string;
    } | undefined>();

    const openProductDialogStore = (product: ProductDataField) => {
        closeProductDialog();
        setProductData(product);
        setDialogUserOpen(true);
    };

    const openProductDialogCart = (product: CartItem) => {
        closeProductDialog();
        setProductData(product);
        setEditCartData({
            quantity: product.quantity,
            uniqueId: product.uniqueId,
        });
        setDialogUserOpen(true);
    };

    const closeProductDialog = () => {
        setIsPending(undefined);
        setSetPending(undefined);
        setSetStoreData(undefined);
        setDialogUserOpen(false);
        setDialogBakerzOpen(false);
        setProductData(undefined);
        setEditCartData(undefined);
    };

    const openProductDialogBakerz = (
        product: ProductDataField,
        isPending: boolean,
        setPending: (isPending: boolean) => void,
        setStoreData: (data: StoreData) => void
    ) => {
        closeProductDialog();
        setProductData(product);
        setIsPending(isPending);
        setSetPending(() => setPending);
        setSetStoreData(() => setStoreData);

        setDialogBakerzOpen(true);
    }



    const editProductDialogBakerz = (
        product: ProductDataField,
        isPending: boolean,
        setPending: (isPending: boolean) => void,
        setStoreData: (data: StoreData) => void
                                     ) => {
        closeProductDialog();
        setProductData(product);
        setIsPending(isPending);
        setSetPending(() => setPending);
        setSetStoreData(() => setStoreData);

        setDialogBakerzEditOpen(true);

    }

    return (
        <ProductDialogContext.Provider value={{ openProductDialogStore, closeProductDialog, openProductDialogCart, openProductDialogBakerz, editProductDialogBakerz }}>
            {children}
            {isDialogUserOpen && productData && (
                <ProductDescriptionUser
                    isDialogOpen={isDialogUserOpen}
                    setDialogOpen={setDialogUserOpen}
                    productData={productData}
                    editCartData={editCartData}
                />
            )}
            {isDialogBakerzOpen && productData && isPending !== undefined && setPending && setStoreData && (
                <ProductDescriptionBakerz
                    isDialogOpen={isDialogBakerzOpen}
                    setDialogOpen={setDialogBakerzOpen}
                    productData={productData}
                    isPending={isPending}
                    setStoreData={setStoreData}
                    setPending={setPending}
                />
            )}
            {isDialogBakerzEditOpen && productData && isPending !== undefined && setPending && setStoreData && (
                <ProductsAdd
                    storeId={productData.store_id}
                    isPending={isPending}
                    setStoreData={setStoreData}
                    setPending={setPending}
                    isDialogOpen={isDialogBakerzEditOpen}
                    setDialogOpen={setDialogBakerzEditOpen}
                    productData={productData}
                    action="update"
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