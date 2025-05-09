"use client";

import {ButtonGroup, cn, NavbarProps, Button} from "@heroui/react";
import React, { useEffect, useState, memo } from "react";
import {
    Navbar,
    NavbarContent,
} from "@heroui/react";
import { useMediaQuery } from "usehooks-ts";
import { StoreData } from "@/lib/actions/store";
import { useStore } from "@/components/providers/store-provider";
import { useSession } from "@/components/providers/session-provider";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { ReturnNavbar } from "./navbars/ReturnNavbar";
import { DefaultNavbar } from "./navbars/DefaultNavbar";
import { MobileNavbar } from "./navbars/MobileNavbar";
import MobileStoreNavbar from "./navbars/MobileStoreNavbar";

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
    const t = useTranslations("app/(landing)/components/navbar");
    const isMobile = useMediaQuery("(max-width: 768px)");
    const { isSticky } = useStore();
    const { session, isSaveOpen, handleSave, isLoading } = useSession();
    const router = useRouter();
    const storeUrl = store?.storeName ? store?.storeName : store?.id;
    const [scrolled, setScrolled] = useState(false);

    // Track scroll position
    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 10);
        };
        
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

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
                    base: cn("sticky py-4 w-full backdrop-filter-none bg-background w-full", scrolled ? `shadow-lg ${isSticky && 'shadow-none'}` : ""),
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
                            t={t}
                        />
                    ) : (
                        <>
                        <DefaultNavbar
                            store={store}
                            session={session}
                            navigateToStore={navigateToStore}
                            t={t}
                        />
                            {(session?.user?.role === "bakerz" && store?.user_id === session?.user.id) && (
                                <div className="bg-background rounded-t-xl fixed bottom-0 left-0 right-0 z-50 p-4 shadow-[0_-4px_12px_-1px_rgba(0,0,0,0.1)]">
                                    <MobileStoreNavbar />
                                </div>
                            )}
                            {!(store?.user_id === session?.user?.id) && (
                                <div className="bg-background rounded-t-xl fixed bottom-0 left-0 right-0 z-50 p-4 shadow-[0_-4px_12px_-1px_rgba(0,0,0,0.1)]">
                                    <MobileNavbar />
                                </div>
                            )}
                        </>
                    )}
                </NavbarContent>
            </Navbar>
            
            {/* Save Changes Button - Memoized component */}
            <SaveButton 
                isMobile={isMobile} handleSave={handleSave} 
                isSaveOpen={isSaveOpen} isBakerz={session?.user?.role === "bakerz" && store?.user_id === session?.user.id} 
                isLoading={isLoading}
            />
        </>
    );
} 