"use client";

import {Button} from "@/components/ui/button";
import * as React from "react";
import {IconMenu} from "@/components/ui/icons";
import {useState} from "react";
import MenuComponent from "@/components/menu/user-menu";


export const MenuButton = ({ menuItems }: { menuItems: React.ReactNode }) => {
    const [isMenuOpen, setMenuOpen] = useState(false);

    // Toggles the visibility of the menu
    const toggleMenu = () => {
        setMenuOpen((prevState) => !prevState);
    };

    return (
        <>
            <Button className="flex p-2 items-center bg-white rounded-full transition duration-500 hover:bg-gray-200" onClick={toggleMenu}>
                <IconMenu className="w-7 h-6" />
            </Button>
            <MenuComponent menuItems={menuItems} isOpen={isMenuOpen} onClose={() => setMenuOpen(false)} />
        </>
    );
}