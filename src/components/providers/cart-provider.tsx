'use client';

import React, { createContext, useContext, ReactNode, useState } from 'react';
import { CartData, ItemCart, updateCart, removeCartItem } from "@/lib/actions/cart";
import showErrorMessage from "@/components/toast/toast-error";
import showSuccessMessage from "@/components/toast/toast-succes";
import {useDisclosure} from "@heroui/react";

interface CartContextProps {
    cart: CartData;
    itemCount: number;
    addItem: (cart: ItemCart) => void;
    updateItem: (cart: ItemCart) => Promise<boolean>;
    removeItem: (cart: ItemCart) => Promise<boolean>;
    removeAllItems: () => void;
    isOpen: boolean;
    onOpen: () => void;
    onOpenChange: () => void;
}

export const useCart = () => {
    const context = useContext(CartContext);
    if (!context) {
        throw new Error('useCart must be used within a CartProvider');
    }
    return context;
};

const CartContext = createContext<CartContextProps | undefined>(undefined);

export const CartProvider: React.FC<{ children: ReactNode; cart: CartData; storeId: string;}> = ({
                                                                                                children,
                                                                                                cart,
                                                                                                storeId
                                                                                            }) => {

    const [cartData, setCart] = useState<CartData>(cart);

    const initialItemCount = cartData[storeId] ? Object.keys(cartData[storeId]).length : 0;
    const [itemCount, setItemCount] = useState<number>(initialItemCount);
    const { isOpen, onOpen, onOpenChange } = useDisclosure();


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
        const result = await updateCart(cart.product_id, cart.store_id, cart.quantity, cart.note, cart.variants, cart.id);
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
            showSuccessMessage({success: "Item updated"});
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
            showSuccessMessage({success: "Item deleted"});
            return true;
        } else {
            console.error("Error removing cart item", result.error);
            showErrorMessage({ error: result.error ? result.error : "Error removing cart item" });
            return false;
        }
    };

    //Remove all items from cart
    const removeAllItems = async () => {
        setItemCount(0);
        setCart({});
    };

    return (
        <CartContext.Provider
            value={{
                cart: cartData,
                itemCount,
                removeItem,
                updateItem,
                addItem,
                removeAllItems,
                isOpen,
                onOpen,
                onOpenChange
            }}
        >
            {children}
        </CartContext.Provider>
    );
};
