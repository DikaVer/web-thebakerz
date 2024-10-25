'use client';

import React, { createContext, useState, useContext, ReactNode } from 'react';
import {CartItem, ProductDataField} from '@/lib/definitions';
import {ProductDescription} from '@/components/user/product-description';

interface ProductDialogContextProps {
    openProductDialogCart: (product: CartItem) => void;
    openProductDialogStore: (product: ProductDataField) => void;
    closeProductDialog: () => void;
}

const ProductDialogContext = createContext<ProductDialogContextProps | undefined>(undefined);

export const ProductDialogProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [isDialogOpen, setDialogOpen] = useState(false);
    const [productData, setProductData] = useState<ProductDataField | undefined>();
    const [editCartData, setEditCartData] = useState<{
        quantity: number;
        uniqueId: string;
    } | undefined>();

    const openProductDialogStore = (product: ProductDataField) => {
        setProductData(product);
        setEditCartData(undefined);
        setDialogOpen(true);
    };

    const openProductDialogCart = (product: CartItem) => {
        setProductData(product);
        setEditCartData({
            quantity: product.quantity,
            uniqueId: product.uniqueId,
        });
        setDialogOpen(true);
    };

    const closeProductDialog = () => {
        setDialogOpen(false);
        setProductData(undefined);
        setEditCartData(undefined);
    };

    return (
        <ProductDialogContext.Provider value={{ openProductDialogStore, closeProductDialog, openProductDialogCart }}>
            {children}
            {isDialogOpen && productData && (
                <ProductDescription
                    isDialogOpen={isDialogOpen}
                    setDialogOpen={setDialogOpen}
                    productData={productData}
                    editCartData={editCartData}
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