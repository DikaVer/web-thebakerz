"use client";

import {Button} from "@/components/ui/button";
import * as React from "react";
import {IconCart} from "@/components/ui/icons";
import {useState} from "react";
import CartComponent from "@/components/cart/cart-component";


export const CartButton = () => {
    const [isCartOpen, setMenuOpen] = useState(false);

    // Toggles the visibility of the menu
    const toggleCart = () => {
        setMenuOpen((prevState) => !prevState);
    };

    const cart = null;

    return (
        <>
            <Button className="flex p-2 items-center bg-white rounded-full transition duration-500 hover:bg-gray-200" onClick={toggleCart}>
                <IconCart className="w-7 h-6" />
            </Button>
            <CartComponent isOpen={isCartOpen} cart={cart} onClose={() => toggleCart()} />
        </>
    );
}