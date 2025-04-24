'use client';

import React, { createContext, useContext, ReactNode, useState } from 'react';
import ProductDialog from "@/components/store/product/dialog/product-dialog";
import { ProductData, ProductDataFull } from "@/lib/actions/product";
import { ItemCart} from "@/lib/actions/cart";
import showErrorMessage from "@/components/toast/toast-error";
import {useRouter} from "next/navigation";

interface ProductDialogContextProps {
    handleOpen: (productId: string, isBakerzStore: boolean, itemCart?: ItemCart) => void;
    getProductDataById: (productId: string) => ProductData | undefined;
    handleOpenWithProduct: (product: ProductData, isBakerzStore: boolean, itemCart?: ItemCart) => void;
    setProductsDataLocal: (data: ProductDataFull) => void;
    handleAddItem: () => void;
}

export const useProductDialog = () => {
    const context = useContext(ProductDialogContext);
    if (!context) {
        throw new Error('useProductDialog must be used within a ProductDialogProvider');
    }
    return context;
};

const ProductDialogContext = createContext<ProductDialogContextProps | undefined>(undefined);

export const ProductDialogProvider: React.FC<{ children: ReactNode;  productsDataServer?: ProductDataFull; storeId: string; storeOwnerId: string; storeName?: string}> = ({children, productsDataServer, storeId, storeOwnerId, storeName}) => {
    const [isOpen, setIsOpen] = useState(false);
    const [productData, setProductData] = useState<ProductData | undefined>();
    const [productsData, setProductsData] = useState<ProductDataFull>(productsDataServer ? productsDataServer : {});
    const [itemCart, setItemCartId] = useState<ItemCart | undefined>();
    const [isBakerzStore, setIsBakerzStore] = useState<boolean>(false);
    const router = useRouter();


    const onClose = () => {
        setIsOpen(false);
        setItemCartId(undefined);
        setProductData(undefined);
    };

    const handleAddItem = () => {
        router.push(`/${storeName || storeId}/item/add-item`);
    }

    const handleOpen = (productId: string, isBakerzStore: boolean, itemCart?: ItemCart) => {
        setProductData(getProductDataById(productId));
        setItemCartId(itemCart);
        setIsBakerzStore(isBakerzStore);
        setIsOpen(true);
    };


    const handleOpenWithProduct = (product: ProductData, isBakerzStore: boolean, itemCart?: ItemCart) => {
        if (product) {
            setProductData(product);
            setItemCartId(itemCart);
            setIsBakerzStore(isBakerzStore);
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
                handleAddItem,
            }}
        >
            <ProductDialog
                productData={productData}
                isOpen={isOpen}
                onClose={onClose}
                itemCart={itemCart}
                isBakerzStore={isBakerzStore}
            />
            {children}
        </ProductDialogContext.Provider>
    );
};
