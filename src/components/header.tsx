'use client';

import * as React from 'react';
import { useState } from 'react';
import { IconCart, IconMenu } from "@/components/ui/icons";
import { Label } from "@/components/ui/label";
import MenuComponent from "@/components/user-menu";
import { Button } from "@/components/ui/button";

export function Header() {
    const [isMenuOpen, setMenuOpen] = useState(false);

    const toggleMenu = () => {
        setMenuOpen(!isMenuOpen);
    };

    return (
        <header className="fixed top-0 w-full z-30 bg-white">
            <nav className="text-black pt-4">
                <div className="container mx-auto flex justify-between items-center">
                    <Button className="flex p-2 items-center bg-white rounded-full transition duration-300 hover:bg-gray-200" onClick={toggleMenu}>
                        <IconMenu />
                    </Button>
                    <div className="hover:scale-125 transition duration-300">
                        <Label className="text-2xl font-bold mx-auto">TheBakerz</Label>
                    </div>
                    <div className="flex p-2 items-center rounded-full transition duration-300 hover:bg-gray-200">
                        <IconCart />
                    </div>
                </div>
                <hr className="mt-2" />
            </nav>
            <MenuComponent isOpen={isMenuOpen} onClose={() => setMenuOpen(false)} />
        </header>
    );
}