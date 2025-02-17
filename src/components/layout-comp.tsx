"use client";

import React, {useEffect} from "react";
import {useDisclosure} from "@heroui/react";
import {useMediaQuery} from "usehooks-ts";
import SidebarMenu from "@/components/sidebar/sidebar-menu";
import NavbarComponent from "@/components/navbar-comp";
import {StoreData} from "@/lib/actions/store";





interface LayoutCompProps {
    children: React.ReactNode;
    store?: StoreData;
    isCheckout?: boolean;
}

export default function LayoutComp({ children, store, isCheckout }: LayoutCompProps) {
    const { isOpen, onOpenChange } = useDisclosure();
    const [isCollapsed, setIsCollapsed] = React.useState(true);
    const isMobile = useMediaQuery("(max-width: 768px)");

    useEffect(() => {
        if (isMobile) {

        }
    }, [isMobile]);

    const onToggle = React.useCallback(() => {
        setIsCollapsed((prev) => !prev);
    }, []);

    return (
        <div className="flex w-full">
            {/* Sidebar */}
            {!isCheckout &&
                <SidebarMenu
                store={store}
                isOpen={isOpen}
                onOpenChange={onOpenChange}
                isCollapsed={isCollapsed}
                isMobile={isMobile}
            />
            }

            <div className="w-full flex-1 flex-col">
                <NavbarComponent
                    store={store}
                    setIsCollapsed={setIsCollapsed}
                    onOpenChange={onOpenChange}
                    onToggle={onToggle}
                    isCheckout={isCheckout}
                />
                <main className=" w-full overflow-visible">
                    {children}
                </main>
            </div>
        </div>
    );
}
