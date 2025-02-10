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
import {StoreData} from "@/lib/actions/store/store";

interface LayoutProps {
    store?: StoreData
    onOpenChange: () => void;
    isCollapsed: boolean;
    setIsCollapsed: (value: boolean) => void;
    isMobile: boolean;
    onToggle: () => void;
    props?: NavbarProps;
}

export default function NavbarComponent({store, isMobile, setIsCollapsed, onOpenChange, isCollapsed, onToggle, props = {}}: LayoutProps) {

    const isSmall = useMediaQuery("(max-width: 1024px)");



    return (
        <>
            <div className={`absolute h-[86px] bg-grayBg/40  backdrop-blur-2xl `}/>
            <Navbar
                {...props}
                classNames={{
                    base: `sticky py-4 backdrop-filter-none bg-transparent`,
                    wrapper: "px-0 w-full justify-center bg-transparent",
                    item: "hidden md:flex",
                }}
                height="54px"
            >
            <NavbarContent
                    className={`flex data-[justify=center]:justify-between w-full ${isMobile ? "max-w-[400px]" : "max-w-2xl"} gap-8 rounded-full border-small border-default-200/20 px-2 shadow-medium backdrop-blur-xl bg-grayBg/50`}
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
                            className={`font-medium ${!isCollapsed && !isMobile && "hidden"} text-2xl ${pacifico.className}`}
                            href={"/"}
                        >
                            {store?.storeName || "TheBakerz"}
                        </a>
                    </NavbarBrand>

                    <NavbarItem className="mr-1 !flex">
                        <SigninButton className={`text-large rounded-full`} variant={"secondary"}/>
                    </NavbarItem>
                </NavbarContent>

            </Navbar>
        </>
    );
}