"use client";

import React, {useEffect} from "react";
import {Spacer, } from "@heroui/react";
import {useMediaQuery} from "usehooks-ts";
import {StoreData} from "@/lib/actions/store";
import {motion, useScroll} from "motion/react";
import { usePathname } from "next/navigation";
import NavbarAdvancedComponent from "@/components/navbar/navbar-advance-comp";      




interface LayoutCompProps {
    children: React.ReactNode;
    store?: StoreData;
    hideSideBar?: boolean;
    isVisibleCart?: boolean;
    pay?: boolean;
}

export default function LayoutComp({ children, store, hideSideBar, pay, isVisibleCart }: LayoutCompProps) {
    const isMobile = useMediaQuery("(max-width: 768px)");

    // Check if path is checkout using pathname
    const pathname = usePathname();
    const isCheckout = pathname.includes(`/${store?.storeName}/checkout`);
    const isPartnerPage = pathname.includes("/become-partner");
    const isPay = pathname.includes(`/${store?.storeName}/pay`);

    useEffect(() => {
        if (isMobile) {

        }
    }, [isMobile]);

    const { scrollYProgress } = useScroll()

    return (
        <div className="flex flex-col min-h-screen w-full">
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
            {/* {!hideSideBar && !isPartnerPage && !isProductPage &&
                <SidebarMenu
                store={store}
                isOpen={isOpen}
                onOpenChange={onOpenChange}
                isCollapsed={isCollapsed}
                isMobile={isMobile}
            />
            } */}

            <div className="flex flex-col flex-1 w-full">
                <NavbarAdvancedComponent
                    store={store}
                    isReturnPage={isPay ? true : hideSideBar || isCheckout || isPartnerPage}
                    isVisibleCart={isVisibleCart}
                    pay={pay || isPay}
                />
                <main className={`flex-1 w-full overflow-visible ${isMobile ? 'pb-24' : ''}`}>
                    {children}
                    <Spacer y={20}/>
                </main>
            </div>
        </div>
    );
}
