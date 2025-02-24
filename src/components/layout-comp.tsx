"use client";

import React, {useEffect} from "react";
import {useDisclosure} from "@heroui/react";
import {useMediaQuery} from "usehooks-ts";
import SidebarMenu from "@/components/sidebar/sidebar-menu";
import {StoreData} from "@/lib/actions/store";
import NavbarComponent from "@/components/navbar/navbar-comp";
import {motion, useScroll} from "motion/react";





interface LayoutCompProps {
    children: React.ReactNode;
    store?: StoreData;
    hideSideBar?: boolean;
}

export default function LayoutComp({ children, store, hideSideBar }: LayoutCompProps) {
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
    const { scrollYProgress } = useScroll()

    return (
        <div className="flex w-full">
            <motion.div
                id="scroll-indicator"
                style={{
                    scaleX: scrollYProgress,
                    position: "fixed",
                    top: 0,
                    left: 0,
                    right: 0,
                    height: "5px",
                    originX: 0,
                    background: "linear-gradient(90deg, #d016ca, #730c70)",
                    zIndex: 9999,
                }}
            />

            {/* Sidebar */}
            {!hideSideBar &&
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
                    hideSideBar={hideSideBar}
                />
                <main className=" w-full overflow-visible">
                    {children}
                </main>
            </div>
        </div>
    );
}
