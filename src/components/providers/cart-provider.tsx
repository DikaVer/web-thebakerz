'use client';

import React, {createContext, useContext, useState, ReactNode, useEffect} from 'react';
import {CartData, CartItem, ProductDataField} from '@/lib/definitions';
import {toast} from "sonner";
import {IconSuccess} from "@/components/ui/icons";
import {createNanoid} from "@/lib/utils";


interface CartContextType {
    cart: CartData;
    addToCart: (product: ProductDataField, quantity: number) => void;
    updateProductCart: (product: CartItem, quantity: number) => void;
    removeFromCart: (storeId: string, productId: string) => void;
    clearCart: () => void;
    getCartCount: (storeId: string) => number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const useCart = (): CartContextType => {
    const context = useContext(CartContext);
    if (!context) {
        throw new Error('useCart must be used within a CartProvider');
    }
    return context;
};

interface CartProviderProps {
    storeData?: {
        storeId: string,
        nickname: string,
        image: string
    } | null;
    children: ReactNode;
}

export const CartProvider: React.FC<CartProviderProps> = ({storeData, children }) => {

    const [cart, setCart] = useState<CartData>({});

    useEffect(() => {
        const storedCart = localStorage.getItem('cart');
        if (storedCart) {
            setCart(JSON.parse(storedCart));
        }
    }, []);

    const addToCart = (product: ProductDataField, quantity: number) => {
        if (storeData) {
            setCart((prevCart) => {

                const storeCart = prevCart[product.store_id]?.products || [];
                let uniqueId: string;
                do {
                    uniqueId = createNanoid(12);
                } while (storeCart.some(item => item.uniqueId === uniqueId));

                const updatedStoreCart = {
                    ...prevCart,
                    [product.store_id]: {
                        ...storeData,
                        products: [
                            ...storeCart,
                            {...product, quantity, uniqueId}
                        ]
                    }
                };
                localStorage.setItem('cart', JSON.stringify(updatedStoreCart));
                return updatedStoreCart;
            });

            toast.success(
                <div className={"flex flex-row gap-x-1 justify-between items-center"}>
                    <IconSuccess color={"primary"} className={"w-10 h-10"}/>

                    <div className={"flex flex-col"}>
                        <p className={"text-base font-bold"}>
                            {product.name} added to the cart
                        </p>
                    </div>
                </div>
            );
        }
    };

    const updateProductCart = (product: CartItem, quantity: number) => {
        setCart((prevCart) => {
            const storeCart = prevCart[product.store_id]?.products || [];
            const existingProductIndex = storeCart.findIndex(item => item.uniqueId === product.uniqueId);
            if (existingProductIndex !== -1) {
                // Update quantity if product already exists
                const updatedStoreCart = [...storeCart];
                updatedStoreCart[existingProductIndex].quantity = quantity;
                const updatedCart = {
                    ...prevCart,
                    [product.store_id]: {
                        ...prevCart[product.store_id],
                        products: updatedStoreCart
                    }
                };
                localStorage.setItem('cart', JSON.stringify(updatedCart));
                return updatedCart;


            } else {
                // Add new product to cart
                let uniqueId: string;
                do {
                    uniqueId = createNanoid(12);
                } while (storeCart.some(item => item.uniqueId === uniqueId));

                const updatedStoreCart = {
                    ...prevCart,
                    [product.store_id]: {
                        ...prevCart[product.store_id],
                        products: [
                            ...storeCart,
                            {...product, quantity, uniqueId}
                        ]
                    }
                };
                localStorage.setItem('cart', JSON.stringify(updatedStoreCart));

                return updatedStoreCart
            }
        });

    };

    const removeFromCart = (storeId: string, productId: string) => {
        // setCart((prevCart) => {
        //     const storeCart = prevCart[storeId] || [];
        //     const updatedStoreCart = storeCart.filter(item => item.id !== productId);
        //     if (updatedStoreCart.length === 0) {
        //         const { [storeId]: _, ...rest } = prevCart;
        //         return rest;
        //     }
        //     return { ...prevCart, [storeId]: updatedStoreCart };
        // });
        setCart((prevCart) => {
            const storeCart = prevCart[storeId]?.products || [];
            const updatedStoreCart = storeCart.filter(item => item.uniqueId !== productId);
            const updatedCart = {
                ...prevCart,
                [storeId]: {
                    ...prevCart[storeId],
                    products: updatedStoreCart
                }
            };
            if (updatedStoreCart.length === 0) {
                const { [storeId]: _, ...rest } = prevCart;
                localStorage.setItem('cart', JSON.stringify(rest));
                return rest;
            }
            localStorage.setItem('cart', JSON.stringify(updatedCart));
            return updatedCart;
        });
    };

    const clearCart = () => {
        setCart({});
    };

    const getCartCount = (storeId: string) => {
        const storeCart = cart[storeId]?.products || [];
        return Math.min(storeCart.reduce((sum, item) => sum + item.quantity, 0), 99);
    };

    return (
        <CartContext.Provider value={{ cart, addToCart, updateProductCart, removeFromCart, clearCart, getCartCount }}>
            {children}
        </CartContext.Provider>
    );
};
