'use client';

import React, { createContext, useContext, ReactNode, useState } from 'react';
import ProductDialog from "@/components/store/product/dialog/product-dialog";
import { ProductData, ProductDataFull } from "@/lib/actions/product";
import { CartData, ItemCart, updateCart, removeCartItem } from "@/lib/actions/cart";
import showErrorMessage from "@/components/toast/toast-error";

interface ProductDialogContextProps {
    handleOpen: (productId?: string, itemCart?: ItemCart) => void;
    getProductDataById: (productId: string) => ProductData | undefined;
    handleOpenWithProduct: (product: ProductData, itemCart?: ItemCart) => void;
    setProductsDataLocal: (data: ProductDataFull) => void;
    cart: CartData;
    itemCount: number;
    addItem: (cart: ItemCart) => void;
    updateItem: (cart: ItemCart) => Promise<boolean>;
    removeItem: (cart: ItemCart) => Promise<boolean>;
}

export const useProductDialog = () => {
    const context = useContext(ProductDialogContext);
    if (!context) {
        throw new Error('useProductDialog must be used within a ProductDialogProvider');
    }
    return context;
};

const ProductDialogContext = createContext<ProductDialogContextProps | undefined>(undefined);

export const ProductDialogProvider: React.FC<{ children: ReactNode; cart: CartData; storeId: string; productsDataServer?: ProductDataFull }> = ({
                                                                                                              children,
                                                                                                              cart,
                                                                                                              storeId,
                                                                                                                productsDataServer,
                                                                                                          }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [productData, setProductData] = useState<ProductData | undefined>();
    const [productsData, setProductsData] = useState<ProductDataFull>(productsDataServer ? productsDataServer : {});
    const [itemCart, setItemCartId] = useState<ItemCart | undefined>();
    const [cartData, setCart] = useState<CartData>(cart);

    const initialItemCount = cartData[storeId] ? Object.keys(cartData[storeId]).length : 0;
    const [itemCount, setItemCount] = useState<number>(initialItemCount);

    const onClose = () => {
        setIsOpen(false);
        setItemCartId(undefined);
        setProductData(undefined);
    };

    const handleOpen = (productId?: string, itemCart?: ItemCart) => {
        setProductData(getProductDataById(productId ? productId : ''));
        setItemCartId(itemCart);
        setIsOpen(true);
    };

    const handleOpenWithProduct = (product: ProductData, itemCart?: ItemCart) => {
        if (product) {
            setProductData(product);
            setItemCartId(itemCart);
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

    const addItem = (cart: ItemCart) => {
        setItemCount((prevCount) => prevCount + 1);
        setCart((prevCart) => ({
            ...prevCart,
            [cart.store_id]: {
                ...prevCart[cart.store_id],
                [cart.id]: cart,
            },
        }));
    };

    // Async update: calls server action updateCart and updates local state
    const updateItem = async (cart: ItemCart) => {
        const result = await updateCart(cart.product_id, cart.store_id, cart.note, cart.quantity, cart.id);
        if (result.success && result.itemCart) {
            setCart((prevCart) => {
                return {
                    ...prevCart,
                    [cart.store_id]: {
                        ...prevCart[cart.store_id],
                        [cart.id]: cart,
                    },
                };
            });
            return true;
        } else {
            showErrorMessage({ error: result.error ? result.error : "Error updating cart item" });
            return false;
        }
    };

    // Async remove: calls server action removeCartItem and updates local state
    const removeItem = async (cart: ItemCart) => {
        const result = await removeCartItem(storeId, cart.id);
        if (result.success) {
            setItemCount((prevCount) => prevCount - 1);
            setCart((prevCart) => {
                const newCart = { ...prevCart };
                if (newCart[cart.store_id]) {
                    delete newCart[cart.store_id][cart.id];
                }
                return newCart;
            });
            return true;
        } else {
            console.error("Error removing cart item", result.error);
            showErrorMessage({ error: result.error ? result.error : "Error removing cart item" });
            return false;
        }
    };

    return (
        <ProductDialogContext.Provider
            value={{
                handleOpenWithProduct,
                handleOpen,
                getProductDataById,
                setProductsDataLocal,
                cart: cartData,
                itemCount,
                removeItem,
                updateItem,
                addItem,
            }}
        >
            <ProductDialog storeId={storeId} productData={productData} isOpen={isOpen} onClose={onClose} itemCart={itemCart} />
            {children}
        </ProductDialogContext.Provider>
    );
};
