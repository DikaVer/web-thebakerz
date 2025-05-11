'use client';

import React, { createContext, useContext, ReactNode, useState, useEffect, useCallback } from 'react';
import { CartData, ItemCart, updateCart, removeCartItem, TypedCartData } from "@/lib/actions/cart";
import { getProductByStoreIdAndProductId } from "@/lib/actions/product";
import showErrorMessage from "@/components/toast/toast-error";
import showSuccessMessage from "@/components/toast/toast-succes";
import {useDisclosure} from "@heroui/react";
import { useDelivery } from './delivery-provider';

type CartType = 'delivery' | 'pickup';

interface CartContextProps {
    cart: CartData;
    itemCount: number;
    total: number;
    addItem: (cart: ItemCart) => void;
    updateItem: (cart: ItemCart) => Promise<boolean>;
    removeItem: (cart: ItemCart) => Promise<boolean>;
    removeAllItems: () => void;
    isOpen: boolean;
    onOpen: () => void;
    onOpenChange: () => void;
    currentCartType: CartType;
    setCurrentCartType: (type: CartType) => void;
}

const CartContext = createContext<CartContextProps | undefined>(undefined);

export const useCart = () => {
    const context = useContext(CartContext);
    if (!context) {
        throw new Error('useCart must be used within a CartProvider');
    }
    return context;
};

export const CartProvider: React.FC<{ 
    children: ReactNode; 
    cart: TypedCartData; 
    storeId: string; 
    initialDeliveryMode: boolean;
}> = ({
    children,
    cart,
    storeId,
    initialDeliveryMode
}) => {
    // State management
    const [typedCarts, setTypedCarts] = useState<TypedCartData>(cart);
    const [currentCartType, setCurrentCartType] = useState<CartType>(initialDeliveryMode ? 'delivery' : 'pickup');
    const [cartData, setCart] = useState<CartData>(cart[currentCartType]);
    const [itemCount, setItemCount] = useState<number>(0);
    const [total, setTotal] = useState<number>(0);
    const { isOpen, onOpen, onOpenChange } = useDisclosure();
    const { setMinLeadTimeProduct } = useDelivery();

    // Calculate cart metrics
    const calculateCartMetrics = useCallback((cart: CartData) => {
        const count = cart[storeId] ? Object.keys(cart[storeId]).length : 0;
        const totalQuantity = cart[storeId] 
            ? Object.values(cart[storeId]).reduce((sum, item) => sum + item.quantity, 0)
            : 0;
        return { count, totalQuantity };
    }, [storeId]);

    // Update cart data when currentCartType changes
    useEffect(() => {
        const newCartData = typedCarts[currentCartType];
        setCart(newCartData);
        const { count, totalQuantity } = calculateCartMetrics(newCartData);
        setItemCount(count);
        setTotal(totalQuantity);
    }, [currentCartType, typedCarts, calculateCartMetrics]);

    // Find product with largest minLeadTime whenever cart changes
    useEffect(() => {
        if (!cartData[storeId]) return;
        
        const maxLeadTime = Object.values(cartData[storeId])
            .reduce((max, item) => Math.max(max, item.min_lead_time), 0);
        
        setMinLeadTimeProduct(maxLeadTime);
    }, [cartData, storeId, setMinLeadTimeProduct]);

    // Cart operations
    const addItem = useCallback((item: ItemCart) => {
        setTypedCarts((prevTypedCarts) => {
            const newTypedCarts = { ...prevTypedCarts };
            const type = item.type as CartType;
            
            if (!newTypedCarts[type][item.store_id]) {
                newTypedCarts[type][item.store_id] = {};
            }
            
            newTypedCarts[type][item.store_id][item.id] = item;
            return newTypedCarts;
        });
    }, []);

    const updateItem = useCallback(async (item: ItemCart) => {
        const result = await updateCart(
            item.product_id, 
            item.store_id, 
            item.quantity, 
            item.type, 
            item.note, 
            item.variants, 
            item.id
        );

        if (result.success && result.itemCart) {
            setTypedCarts((prevTypedCarts) => {
                const newTypedCarts = { ...prevTypedCarts };
                const type = item.type as CartType;
                
                if (!newTypedCarts[type][item.store_id]) {
                    newTypedCarts[type][item.store_id] = {};
                }
                
                newTypedCarts[type][item.store_id][item.id] = item;
                return newTypedCarts;
            });
            return true;
        } else {
            showErrorMessage({ error: result.error || "Error updating cart item" });
            return false;
        }
    }, []);

    const removeItem = useCallback(async (item: ItemCart) => {
        const result = await removeCartItem(storeId, item.id);
        
        if (result.success) {
            setTypedCarts((prevTypedCarts) => {
                const newTypedCarts = { ...prevTypedCarts };
                const type = item.type as CartType;
                
                if (newTypedCarts[type][item.store_id]) {
                    delete newTypedCarts[type][item.store_id][item.id];
                }
                
                return newTypedCarts;
            });
            
            showSuccessMessage({success: "Item deleted"});
            return true;
        } else {
            console.error("Error removing cart item", result.error);
            showErrorMessage({ error: result.error || "Error removing cart item" });
            return false;
        }
    }, [storeId]);

    const removeAllItems = useCallback(async () => {
        setTypedCarts({
            delivery: {},
            pickup: {}
        });
    }, []);

    const contextValue: CartContextProps = {
        cart: cartData,
        itemCount,
        total,
        addItem,
        updateItem,
        removeItem,
        removeAllItems,
        isOpen,
        onOpen,
        onOpenChange,
        currentCartType,
        setCurrentCartType
    };

    return (
        <CartContext.Provider value={contextValue}>
            {children}
        </CartContext.Provider>
    );
};
