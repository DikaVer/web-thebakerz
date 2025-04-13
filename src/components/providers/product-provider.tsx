'use client';

import React, { createContext, useContext, ReactNode, useState } from 'react';
import ProductDialog from "@/components/store/product/dialog/product-dialog";
import { ProductData, ProductDataFull } from "@/lib/actions/product";
import { CartData, ItemCart, updateCart, removeCartItem } from "@/lib/actions/cart";
import showErrorMessage from "@/components/toast/toast-error";

interface ProductDialogContextProps {
    handleOpen: (productId?: string, itemCart?: ItemCart, isBakerzOrder?: boolean) => void;
    getProductDataById: (productId: string) => ProductData | undefined;
    handleOpenWithProduct: (product: ProductData, itemCart?: ItemCart, isBakerzOrder?: boolean) => void;
    setProductsDataLocal: (data: ProductDataFull) => void;
    isUpdating: boolean;
    setIsUpdating: (isUpdating: boolean) => void;
}

export const useProductDialog = () => {
    const context = useContext(ProductDialogContext);
    if (!context) {
        throw new Error('useProductDialog must be used within a ProductDialogProvider');
    }
    return context;
};

const ProductDialogContext = createContext<ProductDialogContextProps | undefined>(undefined);

export const ProductDialogProvider: React.FC<{ children: ReactNode;  productsDataServer?: ProductDataFull; storeId: string; storeOwnerId: string; }> = ({children, productsDataServer, storeId, storeOwnerId}) => {
    const [isOpen, setIsOpen] = useState(false);
    const [productData, setProductData] = useState<ProductData | undefined>();
    const [productsData, setProductsData] = useState<ProductDataFull>(productsDataServer ? productsDataServer : {});
    const [itemCart, setItemCartId] = useState<ItemCart | undefined>();
    const [isBakerzOrder, setIsBakerzOrder] = useState<boolean>(false);
    const [isUpdating, setIsUpdating] = useState<boolean>(false);


    const onClose = () => {
        setIsOpen(false);
        setItemCartId(undefined);
        setProductData(undefined);
    };

    const handleOpen = (productId?: string, itemCart?: ItemCart, isBakerzOrder?: boolean) => {
        setProductData(getProductDataById(productId ? productId : ''));
        setItemCartId(itemCart);
        setIsBakerzOrder(isBakerzOrder ? isBakerzOrder : false);
        setIsOpen(true);
    };


    const handleOpenWithProduct = (product: ProductData, itemCart?: ItemCart, isBakerzOrder?: boolean) => {
        if (product) {
            setProductData(product);
            setItemCartId(itemCart);
            setIsBakerzOrder(isBakerzOrder ? isBakerzOrder : false);
            setIsOpen(true);
        } else {
            showErrorMessage({ error: 'Product not found' });
        }
    };

    const getProductDataById = (productId: string) => {
        return productsData ? productsData[productId] : undefined;
    };

    const setProductsDataLocal = (data: ProductDataFull) => {
        setProductsData(data);
    };



    return (
        <ProductDialogContext.Provider
            value={{
                handleOpenWithProduct,
                handleOpen,
                getProductDataById,
                setProductsDataLocal,
                isUpdating,
                setIsUpdating
            }}
        >
            <ProductDialog
                storeId={storeId}
                storeOwnerId={storeOwnerId}
                productData={productData}
                isOpen={isOpen}
                onClose={onClose}
                itemCart={itemCart}
                bakerzOrder={isBakerzOrder}
                setIsUpdating={setIsUpdating}
            />
            {children}
        </ProductDialogContext.Provider>
    );
};
