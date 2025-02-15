'use client';

import React, {createContext, useContext, ReactNode, useState} from 'react';
import ProductDialog from "@/components/store/product/dialog/product-dialog";
import {ProductData, ProductDataFull} from "@/lib/actions/product";
import {ItemCart} from "@/lib/actions/cart";



interface ProductDialogContextProps {
    handleOpen: (productId?: string, itemCart?: ItemCart) => void;
    getProductDataById: (productId: string) => ProductData | undefined;
    setProductsDataLocal: (data: ProductDataFull) => void;
}

export const useProductDialog = () => {
    const context = useContext(ProductDialogContext);
    if (!context) {
        throw new Error('useProductDialog must be used within a ProductDialogProvider');
    }
    return context;
};

const ProductDialogContext = createContext<ProductDialogContextProps | undefined>(undefined);


export const ProductDialogProvider: React.FC<{ children: ReactNode }> = ({ children }) => {

    const [ isOpen, setIsOpen ] = useState(false);
    const [ productData, setProductData ] = useState<ProductData | undefined>();
    const [ productsData, setProductsData ] = useState<ProductDataFull>();
    const [ itemCart, setItemCartId ] = useState<ItemCart | undefined>();

    const onClose = () => {
        setIsOpen(false);
        setItemCartId(undefined);
        setProductData(undefined);
    }

    const handleOpen = (productId?: string, itemCart?: ItemCart) => {
        setProductData(getProductDataById(productId ? productId : ''));
        setItemCartId(itemCart);
        setIsOpen(true);
    };

    const getProductDataById = (productId: string ) => {
        return productsData ? productsData[productId] : undefined;
    }

    const setProductsDataLocal = (data: ProductDataFull) => {
        setProductsData(data);
    }


    return (
        <ProductDialogContext.Provider
            value={{
                handleOpen,
                getProductDataById,
                setProductsDataLocal,
        }}
        >
            <ProductDialog productData={productData} isOpen={isOpen} onClose={onClose} itemCart={itemCart}/>
            {children}
        </ProductDialogContext.Provider>
    );
};

