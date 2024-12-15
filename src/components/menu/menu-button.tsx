"use client";

import {Button} from "@/components/ui/button";
import * as React from "react";
import {IconMenu} from "@/components/ui/icons";
import {useState} from "react";
import MenuComponent from "@/components/menu/user-menu";
import {useIsMobile} from "@/lib/hooks/use-mobile";


interface MenuButtonProps {
    session: {
        login: boolean;  // Specifies if the user is logged in
        role: string | undefined;  // Role of the user (e.g., admin, user)
        name: string | undefined | null;  // Name of the user
        email: string | undefined | null;  // Email of the user
    }
}

export const MenuButton: React.FC<MenuButtonProps> = ({ session }) => {
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

                onPress={toggleMenu}>
                <IconMenu className="w-7 h-6 text-text" />
            </Button>
            <MenuComponent
                session={session}
                isOpen={isMenuOpen}
                onClose={() => setMenuOpen(false)}
            />
        </>
    );
}