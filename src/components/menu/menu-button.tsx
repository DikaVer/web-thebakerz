"use client";

import {Button} from "@/components/ui/button";
import * as React from "react";
import {IconMenu} from "@/components/ui/icons";
import {useState} from "react";
import MenuComponent from "@/components/menu/user-menu";
import {useIsMobile} from "@/lib/hooks/use-mobile";


export const MenuButton = ({ menuItems }: { menuItems: React.ReactNode }) => {
    const [isMenuOpen, setMenuOpen] = useState(false);

    // Toggles the visibility of the menu
    const toggleMenu = () => {
        setMenuOpen((prevState) => !prevState);
    };

    const isMobile = useIsMobile();
    if (!isMobile) {
        return null;
    }


    return (
        <>
            <Button
                variant={"ghost"}
                className="flex p-2 items-center"

                onClick={toggleMenu}>
                <IconMenu className="w-7 h-6 text-text" />
            </Button>
            <MenuComponent menuItems={menuItems} isOpen={isMenuOpen} onClose={() => setMenuOpen(false)} />
        </>
    );
}