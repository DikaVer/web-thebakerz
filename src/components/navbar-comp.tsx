"use client";

import type {NavbarProps} from "@heroui/react";

import React from "react";
import {  Navbar,
    NavbarBrand,
    NavbarContent,
    NavbarItem,
    Button,
} from "@heroui/react";
import {pacifico} from "@/components/fonts";
import {Icon} from "@iconify/react";
import {SigninButton} from "@/components/ui/signin-button";
import {useMediaQuery} from "usehooks-ts";
import {StoreData} from "@/lib/actions/store";
import {useStore} from "@/components/providers/store-provider";
import {Badge} from "@heroui/badge";
import CartButton from "@/components/cart/cart-button";

interface LayoutProps {
    store?: StoreData
    onOpenChange: () => void;
    setIsCollapsed: (value: boolean) => void;
    onToggle: () => void;
    props?: NavbarProps;
}

export default function NavbarComponent({store, setIsCollapsed, onOpenChange, onToggle, props = {}}: LayoutProps) {

    const isSmall = useMediaQuery("(max-width: 1024px)");

    const { isSticky } = store ? useStore() : {isSticky: false};

    return (
        <>

            <Navbar
                {...props}
                classNames={{
                    base: `sticky py-4 w-full backdrop-filter-none bg-transparent`,
                    wrapper: "px-4 w-full justify-center bg-transparent max-w-[1400px]",
                    item: "hidden md:flex ",

                }}
                className={'z-40'}
                height="54px"
            >
            <NavbarContent
                    className={`flex data-[justify=center]:justify-between w-full gap-8 rounded-full ${isSticky && "rounded-3xl rounded-b-none" } border-small border-default-200/20 px-2 shadow-medium backdrop-blur-xl`}
                    justify={"center"}
                >
                    {/* Toggle */}
                    <NavbarItem className="ml-1 !flex">
                        <Button isIconOnly size="sm" variant="light" onPress={() => {
                            if (isSmall) {
                                setIsCollapsed(false);
                                onOpenChange();
                            } else {
                                onToggle();
                            }
                        }}
                        >
                            <Icon
                                className="text-default-500"
                                height={24}
                                icon="solar:sidebar-minimalistic-outline"
                                width={24}
                            />
                        </Button>
                    </NavbarItem>


                    {/* Logo */}
                    <NavbarBrand className=" w-[40rem]  max-w-fit">
                        <a
                            className={`font-medium text-2xl ${pacifico.className}`}
                            href={store?.ownerName ? `/${store?.storeName}` : "/"}
                        >
                            {store?.ownerName || "TheBakerz"}
                        </a>
                    </NavbarBrand>
                {store ? (
                    <NavbarItem className="mr-1 !flex">
                        <CartButton
                            ownerName={store.ownerName}
                        />
                    </NavbarItem>
                    ):(
                    <NavbarItem className="mr-1 !flex">
                        <SigninButton className={`text-large rounded-full`}/>
                    </NavbarItem>
                )}
                </NavbarContent>

            </Navbar>
        </>
    );
}