/**
 * @fileoverview Client-side shopping cart context provider and useCart hook.
 *
 * Exports CartProvider, which supplies CartContext with per-store cart data
 * split into delivery and pickup cart types, item count and quantity totals,
 * add/update/remove operations backed by the cart server actions, and cart
 * drawer open state. It syncs the active cart type with the delivery
 * provider, propagates the largest product lead time to it, and validates
 * cart quantities against available rescue deal stock.
 */
'use client';

import React, { createContext, useContext, ReactNode, useState, useEffect, useCallback } from 'react';
import { CartData, ItemCart, updateCart, removeCartItem, TypedCartData } from "@/lib/actions/cart";
import showErrorMessage from "@/components/toast/toast-error";
import {useDisclosure} from "@heroui/react";
import { useDelivery } from './delivery-provider';
import { RescueDeal } from '@/lib/actions/rescue-deal';
import clarity from "@microsoft/clarity";

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
    validateRescueDealsQuantity: () => { isValid: boolean; exceedsQuantity: ItemCart[] };
    rescueDeals: RescueDeal | null;
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
    rescueDeals?: RescueDeal | null;
}> = ({
    children,
    cart,
    storeId,
    initialDeliveryMode,
    rescueDeals = null
}) => {
    // State management
    const [typedCarts, setTypedCarts] = useState<TypedCartData>(cart);
    const [currentCartType, setCurrentCartType] = useState<CartType>(initialDeliveryMode ? 'delivery' : 'pickup');
    const [cartData, setCart] = useState<CartData>(cart[currentCartType]);
    const [itemCount, setItemCount] = useState<number>(0);
    const [total, setTotal] = useState<number>(0);
    const { isOpen, onOpen, onOpenChange } = useDisclosure();
    const { setMinLeadTimeProduct, isRescueDeal, isDelivery } = useDelivery();

    // Calculate cart metrics
    const calculateCartMetrics = useCallback((cart: CartData) => {
        const count = cart[storeId] ? Object.keys(cart[storeId]).length : 0;
        const totalQuantity = cart[storeId] 
            ? Object.values(cart[storeId]).reduce((sum, item) => sum + item.quantity, 0)
            : 0;
        return { count, totalQuantity };
    }, [storeId]);

    // Sync cart type with delivery provider's isDelivery state
    useEffect(() => {
        const newCartType: CartType = isDelivery ? 'delivery' : 'pickup';
        if (newCartType !== currentCartType) {
            setCurrentCartType(newCartType);
        }
    }, [isDelivery, currentCartType]);

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
            .reduce((max, item) => {
                // Skip items without min_lead_time or if it's undefined/null
                if (!item.min_lead_time) return max;
                return Math.max(max, item.min_lead_time);
            }, 0);
        
        setMinLeadTimeProduct(maxLeadTime);
    }, [JSON.stringify(cartData[storeId]), storeId, setMinLeadTimeProduct]);

    // Validate rescue deals quantity - ensure cart items don't exceed available rescue deal stock
    const validateRescueDealsQuantity = useCallback(() => {
        if (!isRescueDeal || !rescueDeals || !cartData[storeId]) {
            return { isValid: true, exceedsQuantity: [] };
        }

        const exceedsQuantity: ItemCart[] = [];
        const cartItems = Object.values(cartData[storeId]);

        cartItems.forEach(cartItem => {
            const rescueDealProduct = rescueDeals.products?.find(p => p.id === cartItem.product_id);
            
            if (rescueDealProduct && rescueDealProduct.isSelected) {
                // Check if cart quantity exceeds available rescue deal quantity
                if (cartItem.quantity > rescueDealProduct.quantity) {
                    exceedsQuantity.push(cartItem);
                }
            }
        });

        return {
            isValid: exceedsQuantity.length === 0,
            exceedsQuantity
        };
    }, [isRescueDeal, rescueDeals, cartData, storeId]);

    // Cart operations
    const addItem = useCallback((item: ItemCart) => {
        clarity.event("cart_add_item")
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
        clarity.event("cart_update_item")
        
        // Check rescue deal quantity limits before updating
        if (isRescueDeal && rescueDeals) {
            const rescueDealProduct = rescueDeals.products?.find(p => p.id === item.product_id);
            if (rescueDealProduct && rescueDealProduct.isSelected && item.quantity > rescueDealProduct.quantity) {
                showErrorMessage({ 
                    error: `Cannot add ${item.quantity} items. Only ${rescueDealProduct.quantity} available in rescue deal.` 
                });
                return false;
            }
        }

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
        clarity.event("cart_remove_item")
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
        setCurrentCartType,
        validateRescueDealsQuantity,
        rescueDeals
    };

    return (
        <CartContext.Provider value={contextValue}>
            {children}
        </CartContext.Provider>
    );
};
