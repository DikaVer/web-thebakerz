"use client";

import type {NavbarProps} from "@nextui-org/react";

import React from "react";
import {  Navbar,
    NavbarBrand,
    NavbarContent,
    NavbarItem,
    Button,
} from "@nextui-org/react";
import {pacifico} from "@/components/fonts";
import {Icon} from "@iconify/react";
import {SigninButton} from "@/components/ui/signin-button";

interface LayoutProps {
    onOpenChange: () => void;
    isCollapsed: boolean;
    setIsCollapsed: (value: boolean) => void;
    isMobile: boolean;
    onToggle: () => void;
    props?: NavbarProps;
}

export default function NavbarComponent({isMobile, setIsCollapsed, onOpenChange, isCollapsed, onToggle, props = {}}: LayoutProps) {

    return (
        <>



            <div className={`absolute  h-[86px] bg-grayBg/40  backdrop-blur-2xl `}/>
            <Navbar
                {...props}
                classNames={{
                    base: "sticky py-4 backdrop-filter-none bg-transparent",
                    wrapper: "px-0 w-full justify-center bg-transparent",
                    item: "hidden md:flex",
                }}
                height="54px"
            >
            <NavbarContent
                    className="justify-center gap-4 md:gap-[10vw] rounded-full border-small border-default-200/20 px-2 shadow-medium backdrop-blur-xl bg-grayBg/50"
                    justify="center"
                >
                    {/* Toggle */}
                    <NavbarItem className="mr-2 !flex">
                        <Button isIconOnly size="sm" variant="light" onPress={() => {
                            if (isMobile) {
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
                    <NavbarBrand className="mr-2 w-[40vw]  max-w-fit">
                        <a
                            className={`font-medium ${!isCollapsed && !isMobile && "hidden"} text-2xl ${pacifico.className}`}
                            href={"/"}
                        >
                            TheBakerz
                        </a>
                    </NavbarBrand>

                    <NavbarItem className="ml-2 !flex">
                        <SigninButton className={`text-large rounded-full`} variant={"secondary"}/>
                    </NavbarItem>
                </NavbarContent>

            </Navbar>
        </>
    );
}