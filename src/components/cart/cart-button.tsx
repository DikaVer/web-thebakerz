"use client";

import {Button} from "@/components/ui/button";
import * as React from "react";
import {IconCart} from "@/components/ui/icons";
import {useEffect, useState} from "react";
import CartComponent from "@/components/cart/cart-component";
import {useCart} from "@/components/providers/cart-provider";


export const CartButton = ({
        storeId
                           } : {
        storeId?: string;
}) => {

    const [isCartOpen, setMenuOpen] = useState(false);

    const { getCartCount, cart } = useCart();

    // Toggles the visibility of the menu
    const toggleCart = () => {
        setMenuOpen((prevState) => !prevState);
    };

    const count = storeId ? getCartCount(storeId) : 0;


    return (
        <>
            <Button className="flex p-2 items-center bg-white rounded-full transition duration-500 hover:bg-gray-200" onClick={toggleCart}>
                {count > 0 &&
                    <div className="absolute w-5 h-5 bg-primary rounded-full ml-6 mb-6">
                        <span className="text-white text-sm font-medium">{count}</span>
                    </div>
                }
                <IconCart className="w-7 h-6" />
            </Button>
            <CartComponent
                isOpen={isCartOpen}
                cart={cart}
                onClose={() => toggleCart()}
            />
        </>
    );
}