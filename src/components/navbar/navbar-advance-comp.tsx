"use client";

import {cn, NavbarProps, Button} from "@heroui/react";
import React, { useEffect, useState, memo } from "react";
import {
    Navbar,
    NavbarContent,
} from "@heroui/react";
import { useMediaQuery } from "usehooks-ts";
import { StoreData } from "@/lib/actions/store";
import { useStore } from "@/components/providers/store-provider";
import { useSession } from "@/components/providers/session-provider";
import { usePathname, useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { ReturnNavbar } from "./navbars/ReturnNavbar";
import { DefaultNavbar } from "./navbars/DefaultNavbar";
import { MobileNavbar } from "./navbars/MobileNavbar";
import MobileStoreNavbar from "./navbars/MobileStoreNavbar";
import { DeliveryNavbar } from "./navbars/DeliveryNavbar";

interface LayoutProps {
    store?: StoreData;
    props?: NavbarProps;
    isReturnPage?: boolean;
    isVisibleCart?: boolean;
    pay?: boolean;
}

// Create a separate memoized SaveButton component to prevent unnecessary re-renders
const SaveButton = memo(({ isMobile, handleSave, isSaveOpen, isBakerz, isLoading }: { 
    isMobile: boolean, 
    handleSave: () => void,
    isSaveOpen: boolean,
    isBakerz: boolean,
    isLoading: boolean
}) => {
    if (!isSaveOpen) return null;
    
    return (
        <div className={`fixed flex items-center justify-center w-full z-50 ${isMobile ? 'bottom-24' : 'bottom-8'} ${isBakerz && 'bottom-[100px]'}`}>
            <Button 
                aria-label="Save changes"
                color="primary"
                isLoading={isLoading}
                className="shadow-lg w-full max-w-2xl border-foreground border-2 bg-gradient-primary"
                onPress={handleSave}
            >
                Save Changes
            </Button>
        </div>
    );
});

SaveButton.displayName = "SaveButton";

export default function NavbarAdvancedComponent({
    store,
    isVisibleCart,
    isReturnPage,
    pay = false,
    props = {},
}: LayoutProps) {
    const isMobile = useMediaQuery("(max-width: 768px)");
    const { isSticky } = useStore();
    const { session, isSaveOpen, handleSave, isLoading } = useSession();
    const router = useRouter();
    const storeUrl = store?.storeName ? store?.storeName : store?.id;
    const [scrolled, setScrolled] = useState(false);
    const [isVisible, setIsVisible] = useState(true);
    const prevScrollY = React.useRef(0);
    const blocking = React.useRef(false);
    const SCROLL_THRESHOLD = 10;
    const isShowDelivery = useMediaQuery(store ? "(max-width: 1200px)" : "(max-width: 948px)");
    const isTabletRange = useMediaQuery("(min-width: 769px) and (max-width: 1200px)");

    const pathname = usePathname();
    const isAddItemPage = pathname.includes("add-item");
    const isSettingsPage = pathname.includes("settings");
    const isOrdersPage = pathname.includes("orders");
    const isOrderPage = pathname.includes("order");
    const isRescueDealPage = pathname.includes("rescue-deal");
    const isProductSettingsPage = pathname.includes("products");
    const isAboutUs = pathname.includes('about-us')

    const isStoreSettingsPage = isProductSettingsPage || isRescueDealPage || isOrdersPage || isOrderPage || isSettingsPage || isAddItemPage || isAboutUs;

    // Track scroll position and direction with improved performance
    useEffect(() => {
        const updateScrollDirection = () => {
            const currentScrollY = window.scrollY;
            
            // Determine if scrolled
            setScrolled(currentScrollY > 10);
            
            // More responsive scroll detection
            if (Math.abs(currentScrollY - prevScrollY.current) > SCROLL_THRESHOLD) {
                const isScrollingUp = currentScrollY < prevScrollY.current;
                
                // Faster, more synchronized visibility logic
                if (isMobile) {
                    // On mobile, immediate response to scroll direction
                    if (isScrollingUp || currentScrollY < 50) {
                        setIsVisible(true);
                    } else {
                        setIsVisible(false);
                    }
                } else if (isTabletRange) {
                    // On tablet (769px-1200px), responsive main navbar
                    setIsVisible(isScrollingUp || currentScrollY < 20);
                } else {
                    // On desktop (>1200px), always show main navbar
                    setIsVisible(true);
                }
                
                // Update previous scroll position
                prevScrollY.current = currentScrollY > 0 ? currentScrollY : 0;
            }
            
            blocking.current = false;
        };
        
        const handleScroll = () => {
            if (!blocking.current) {
                blocking.current = true;
                window.requestAnimationFrame(updateScrollDirection);
            }
        };
        
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, [isMobile, isTabletRange]);

    // Extract navigation logic to avoid repetition
    const navigateToStore = React.useCallback(() => {
        const navigation = pay ? `/${storeUrl}/checkout` : `/${storeUrl}`;
        router.push(navigation);
        router.refresh();
    }, [router, store]);

    return (
        <>
            <Navbar
                {...props}
                classNames={{
                    base: cn("sticky py-4 w-full backdrop-filter-none bg-background w-full transition-all duration-200", scrolled ? `shadow-lg ${(isSticky || isVisible) && 'shadow-none'}` : ""),
                    wrapper:
                        "px-4 max-w-full justify-center bg-background",
                    item: "hidden md:flex",
                }}
                className="z-40"
                height="28px"
            >
                <NavbarContent
                    className={cn(`flex w-full data-[justify=center]:justify-between`)}
                    justify="center"
                >
                    {isReturnPage ? (
                        <ReturnNavbar
                            store={store}
                            navigateToStore={navigateToStore}
                            isVisibleCart={isVisibleCart}
                            session={session}
                        />
                    ) : (
                        <>
                        <DefaultNavbar
                            store={store}
                            session={session}
                            navigateToStore={navigateToStore}
                        />
                            {(session?.user?.role === "bakerz" && store?.user_id === session?.user.id) && (
                                <div className="bg-background rounded-t-xl fixed bottom-0 left-0 right-0 z-50 p-2 shadow-[0_-4px_12px_-1px_rgba(0,0,0,0.1)]">
                                    <MobileStoreNavbar />
                                </div>
                            )}
                            {(!(store?.user_id === session?.user?.id) && store) && (
                                <div className="bg-background rounded-t-xl fixed bottom-0 left-0 right-0 z-50 p-2 shadow-[0_-4px_12px_-1px_rgba(0,0,0,0.1)]">
                                    <MobileNavbar />
                                </div>
                            )}
                        </>
                    )}
                </NavbarContent>
            </Navbar>

            {(!isReturnPage && isShowDelivery && !pay && !isStoreSettingsPage) && (
                <DeliveryNavbar
                    isVisible={isVisible || !isMobile}
                    store={store}
                />
            )}
           
            {/* Save Changes Button - Memoized component */}
            <SaveButton 
                isMobile={isMobile} handleSave={handleSave} 
                isSaveOpen={isSaveOpen} isBakerz={session?.user?.role === "bakerz" && store?.user_id === session?.user.id} 
                isLoading={isLoading}
            />
        </>
    );
} 