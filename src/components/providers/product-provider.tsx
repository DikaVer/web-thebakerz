'use client';

import React, {createContext, useContext, ReactNode, useState} from 'react';
import ProductDialog from "@/components/store/product/dialog/product-dialog";
import {ProductData, ProductDataFull} from "@/lib/actions/product";
import {CartData, ItemCart} from "@/lib/actions/cart";



interface ProductDialogContextProps {
    handleOpen: (productId?: string, itemCart?: ItemCart) => void;
    getProductDataById: (productId: string) => ProductData | undefined;
    setProductsDataLocal: (data: ProductDataFull) => void;
    cart: CartData;
    itemCount: number;
    addItem: (cart: ItemCart) => void;
    updateItem: (cart: ItemCart) => void;
    removeItem: (cart: ItemCart) => void;
}

export const useProductDialog = () => {
    const context = useContext(ProductDialogContext);
    if (!context) {
        throw new Error('useProductDialog must be used within a ProductDialogProvider');
    }
    return context;
};

const ProductDialogContext = createContext<ProductDialogContextProps | undefined>(undefined);


export const ProductDialogProvider: React.FC<{ children: ReactNode, cart: CartData, storeId: string  }> = ({ children, cart, storeId }) => {

    const [ isOpen, setIsOpen ] = useState(false);
    const [ productData, setProductData ] = useState<ProductData | undefined>();
    const [ productsData, setProductsData ] = useState<ProductDataFull>();
    const [ itemCart, setItemCartId ] = useState<ItemCart | undefined>();
    const [cartData, setCart] = useState<CartData>(cart);

    const initialItemCount = cartData[storeId]
        ? Object.keys(cartData[storeId]).length
        : 0;

    const [itemCount, setItemCount] = useState<number>(initialItemCount);

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

    const addItem = (cart: ItemCart) => {
        setItemCount((prevCount) => prevCount + 1);
        setCart((prevCart) => {
            return {
                ...prevCart,
                [cart.store_id]: {
                    ...prevCart[cart.store_id],
                    [cart.id]: cart,
                },
            };
        });
    }

    const updateItem = (cart: ItemCart) => {
        setCart((prevCart) => {
            return {
                ...prevCart,
                [cart.store_id]: {
                    ...prevCart[cart.store_id],
                    [cart.id]: cart,
                },
            };
        });
    }

    const removeItem = (cart: ItemCart) => {
        setItemCount((prevCount) => prevCount - 1);
        setCart((prevCart) => {
            const newCart = { ...prevCart };
            delete newCart[cart.store_id][cart.id];
            return newCart;
        });
    }


    return (
        <ProductDialogContext.Provider
            value={{
                handleOpen,
                getProductDataById,
                setProductsDataLocal,
                cart: cartData,
                itemCount,
                removeItem,
                updateItem,
                addItem
        }}
        >
            <ProductDialog productData={productData} isOpen={isOpen} onClose={onClose} itemCart={itemCart}/>
            {children}
        </ProductDialogContext.Provider>
    );
};

