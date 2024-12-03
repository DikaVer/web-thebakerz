"use client";

import React, {useState} from "react";
import {Badge,  Switch} from "@nextui-org/react";
import {IconNotification} from "@/components/ui/icons";
import {Button} from "@/components/ui/button";
import {useCart} from "@/components/providers/cart-provider";
import NotificationComponent from "@/components/notification/notification-component";

export default function NotificationButton() {

    const [isCartOpen, setMenuOpen] = useState(false);

    // Toggles the visibility of the menu
    const toggleCart = () => {
        setMenuOpen((prevState) => !prevState);
    };


    return (
        <>
            <Button
                className="flex p-2 pt-5 items-center rounded-full"
                variant={"ghost"}
                onClick={toggleCart}
            >
                <Badge color="primary" content={1} shape="circle">
                    <IconNotification className=" w-8 h-8 text-text"/>
                </Badge>
            </Button>
            <NotificationComponent isOpen={isCartOpen} onClose={() => toggleCart()}/>
        </>
    );
}