"use client";

import {Button} from "@/components/ui/button";
import * as React from "react";
import {IconCart} from "@/components/ui/icons";
import {useEffect, useState} from "react";
import CartComponent from "@/components/cart/cart-component";
import {useCart} from "@/components/providers/cart-provider";
import {Badge} from "@nextui-org/badge";


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
            <Button className="flex p-2 items-center rounded-full"
                    size={"lg"}
                    variant={"ghost"}
                    onPress={toggleCart}
            >
                    <Badge color="primary" content={count} isInvisible={count <= 0} shape="circle">
                        <IconCart className="w-7 h-6 pr-1 text-text"/>
                    </Badge>
            </Button>
            <CartComponent
                isOpen={isCartOpen}
                cart={cart}
                onClose={() => toggleCart()}
            />
        </>
    );
}