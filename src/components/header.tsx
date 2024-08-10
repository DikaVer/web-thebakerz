'use client';

import * as React from 'react';
import { useState } from 'react';
import { IconCart, IconMenu } from "@/components/ui/icons";
import { Label } from "@/components/ui/label";
import MenuComponent from "@/components/menu/user-menu";
import CartComponent from "@/components/cart/cart";
import { Button } from "@/components/ui/button";

export function Header() {
    const [isMenuOpen, setMenuOpen] = useState(false);
    const [isCartOpen, setCartOpen] = useState(false);

    const toggleMenu = () => {
        setMenuOpen(!isMenuOpen);
    };

    const toggleCart = () => {
        setCartOpen(!isCartOpen);
    };

    return (
        <header className="sticky top-0 w-full z-30 bg-white">
            <nav className="text-black pt-4">
                <div className="container mx-auto flex justify-between items-center">
                    <Button className="flex p-2 items-center bg-white rounded-full transition duration-500 hover:bg-gray-200" onClick={toggleMenu}>
                        <IconMenu />
                    </Button>
                    <div className="hover:scale-125 transition duration-500">
                        <Label className="text-2xl font-bold mx-auto">TheBakerz</Label>
                    </div>
                    <Button className="flex p-2 items-center bg-white rounded-full transition duration-500 hover:bg-gray-200" onClick={toggleCart}>
                        <IconCart />
                    </Button>
                </div>
                <hr className="mt-2" />
            </nav>
            <MenuComponent isOpen={isMenuOpen} onClose={() => setMenuOpen(false)} />
            <CartComponent isOpen={isCartOpen} onClose={() => setCartOpen(false)} />
        </header>
    );
}