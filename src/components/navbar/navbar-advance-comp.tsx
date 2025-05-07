"use client";

import {ButtonGroup, cn, NavbarProps} from "@heroui/react";
import React, { useEffect, useState } from "react";
import {
    Navbar,
    NavbarBrand,
    NavbarContent,
    NavbarItem,
    Button,
    Image,
    Avatar
} from "@heroui/react";
import { pacifico } from "@/components/fonts";
import { Icon } from "@iconify/react";
import { SigninButton } from "@/components/ui/signin-button";
import { useMediaQuery } from "usehooks-ts";
import { StoreData } from "@/lib/actions/store";
import { useStore } from "@/components/providers/store-provider";
import CartButton from "@/components/cart/cart-button";
import {usePathname, useRouter, useSearchParams} from "next/navigation";
import { useSession } from "@/components/providers/session-provider";
import {useTranslations} from "next-intl";
import {SessionValidationResult} from "@/lib/actions/session";
import { JoinButton } from "../ui/join-button";
import GradientText from "../ui/gradient-text";
import LanguageModal from "@/components/language-modal";
import { useDelivery } from "../providers/delivery-provider";
import { SelectTime } from "../ui/select-time";

interface LayoutProps {
    store?: StoreData;
    onOpenChange: () => void;
    setIsCollapsed: (value: boolean) => void;
    onToggle: () => void;
    props?: NavbarProps;
    hideSideBar?: boolean;
    isVisibleCart?: boolean;
    pay?: boolean;
}


export default function NavbarAdvancedComponent({
                                            store,
                                            setIsCollapsed,
                                            onOpenChange,
                                            onToggle,
                                            isVisibleCart,
                                            hideSideBar,
                                            pay = false,
                                            props = {},
                                        }: LayoutProps) {
    const t = useTranslations("app/(landing)/components/navbar");
    const isMobile = useMediaQuery("(max-width: 768px)");
    const { isSticky } = useStore();
    const { session } = useSession();
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
                    className={cn(`flex w-full data-[justify=center]:justify-between w-full gap-8`)}
                    justify="center"
                >
                    {hideSideBar ? (
                        <ReturnNavbar
                            store={store}
                            navigateToStore={navigateToStore}
                            isVisibleCart={isVisibleCart}
                            session={session}
                            t={t}
                        />
                    ) : (
                        <DefaultNavbar
                            store={store}
                            session={session}
                            navigateToStore={navigateToStore}
                            t={t}
                        />
                    )}
                </NavbarContent>
            </Navbar>
            {isMobile && (
                <div className="bg-background fixed bottom-0 left-0 right-0 z-50 p-4">
                    <MobileNavbar />
                </div>
            )}
        </>
    );
}

interface NavbarTranslationProps {
    t: (key: string) => string;
}

interface CheckoutNavbarProps extends NavbarTranslationProps {
    store?: StoreData;
    navigateToStore: () => void;
    isVisibleCart?: boolean;
    session: SessionValidationResult;
}

const ReturnNavbar: React.FC<CheckoutNavbarProps> = ({
                                                           store,
                                                           navigateToStore, t, isVisibleCart, session
                                                       }) => {

    const router = useRouter();
    const pathname = usePathname();
    const isPartnerPage = pathname.includes("/become-partner");
    const redirectToStore = () => {
        if (store) {
            navigateToStore();
        } else {
            if (isPartnerPage) {
                router.push("/");
            } else {
                router.back();
            }
        }
    }

    return (
        <>
            <NavbarItem className="ml-1 !flex">
                <Button
                    size="md"
                    variant="light"
                    className="text-default-500"
                    onPress={redirectToStore}
                    startContent={
                        <Icon
                            className="text-default-500"
                            height={24}
                            icon="solar:alt-arrow-left-linear"
                            width={24}
                        />
                    }
                >
                    {t("back")} {store?.ownerName && `${t("backTo")} ${store.ownerName}`}
                </Button>
            </NavbarItem>
            <NavbarItem className="ml-1 !flex">
                {store ? !isVisibleCart ? (
                        <Avatar
                            alt="Avatar"
                            isBordered
                            onClick={navigateToStore}
                            showFallback={!!store?.picture}
                            size="sm"
                            name={store?.ownerName}
                            src={store?.picture}
                            color="secondary"
                            classNames={{
                                base: "bg-default text-text shadow-lg cursor-pointer",
                            }}
                        />
                     ) : (session?.user && store?.user_id === session?.user.id) ? (
                        <Image
                            src="/images/TheBakerzLogo.svg"
                            alt="Logo"
                            width={32}
                            radius="full"
                        />
                        ) : (
                            <CartButton />
                        )

                    :
                        isPartnerPage ? (
                            <JoinButton />
                        ) : (
                            <Image
                            src="/images/TheBakerzLogo.svg"
                            alt="Logo"
                            width={32}
                            radius="full"
                        />
                        )
                
                    }
            </NavbarItem>
        </>
    );
};

interface DefaultNavbarProps extends NavbarTranslationProps {
    store?: StoreData;
    session: SessionValidationResult;
    navigateToStore: () => void;
}

const DefaultNavbar: React.FC<DefaultNavbarProps> = ({
                                                         store,
                                                         session,
                                                         navigateToStore,
    t
                                                     }) => {

    const pathname = usePathname();
    const searchParams = useSearchParams();
    const isFromSearch = searchParams.get("from") === "search";
    const isPartnerPage = pathname.includes("/become-partner");
    const isProductPage = pathname.includes(`/${store?.storeName}/item`);
    const [isLanguageOpen, setIsLanguageOpen] = useState(false);
    const isMobile = useMediaQuery("(max-width: 768px)");
    const router = useRouter();
    const { isDelivery, toggleDeliveryMode, isTogglingDelivery, isSubheaderLoaded } = useDelivery();
    const cT = useTranslations("app/(store)/components/store-header");


    return (
        <>
            <NavbarBrand className="flex items-center gap-3">

                {store ? (
                    <div className="flex items-center gap-2 cursor-pointer" onClick={navigateToStore}>
                        <GradientText className={cn("text-xl md:text-2xl font-medium", pacifico.className)}>
                            {store.ownerName}
                        </GradientText>
                    </div>
                ) : (
                    <div className="flex items-center cursor-pointer" onClick={() => router.push("/")}>
                        <Image
                            src="/images/TheBakerzLogo.svg"
                            alt="Logo"
                            width={32}
                            radius="full"
                        />
                        <GradientText className={cn("text-lg font-medium ml-2", pacifico.className)}>
                            TheBakerz
                        </GradientText>
                    </div>
                )}
                <div className="flex items-center justify-start w-full py-4">
                        <div className="relative p-1 rounded-xl bg-background">
                            <ButtonGroup
                                isIconOnly
                             className="relative z-10 overflow-hidden" isDisabled={isTogglingDelivery || !isSubheaderLoaded}>
                                <Button
                                    disableRipple
                                    onPress={() => toggleDeliveryMode(false)}
                                    isIconOnly
                                    className={cn(
                                        "md:min-w-32 transition-all duration-300 data-[hover=true]:bg-transparent",
                                        !isDelivery ? "text-foreground-secondary font-medium" : "text-default-500 font-normal",
                                        isTogglingDelivery || !isSubheaderLoaded ? "opacity-50" : "opacity-100"
                                    )}
                                    variant="light"
                                    isDisabled={isTogglingDelivery || !isSubheaderLoaded}
                                >
                                    <div className="flex items-center gap-2">
                                        <Icon
                                            icon="solar:shop-2-bold"
                                            width={20}
                                            height={20}
                                            className={cn(
                                                "transition-all duration-300",
                                                !isDelivery ? "text-primary" : "text-default-500"
                                            )}
                                        />
                                        <span className={cn("text-sm hidden md:block", isDelivery ? "text-default-500" : "text-foreground-secondary")}>{cT('pickup')}</span>
                                    </div>
                                </Button>
                                <Button
                                    disableRipple
                                    onPress={() => toggleDeliveryMode(true)}
                                    className={cn(
                                        "md:min-w-32 transition-all duration-300 data-[hover=true]:bg-transparent",
                                        isDelivery ? "text-foreground-secondary font-medium" : "text-default-500 font-normal",
                                        isTogglingDelivery || !isSubheaderLoaded ? "opacity-50" : "opacity-100"
                                    )}
                                    variant="light"
                                    isDisabled={isTogglingDelivery || !isSubheaderLoaded}
                                >
                                    <div className="flex items-center gap-2">
                                        <Icon
                                            icon="solar:scooter-bold"
                                            width={20}
                                            height={20}
                                            className={cn(
                                                "transition-all duration-300",
                                                isDelivery ? "text-primary" : "text-default-500"
                                            )}
                                        />
                                        <span className={cn("text-sm hidden md:block", isDelivery ? "text-foreground-secondary" : "text-default-500")}>{cT('delivery')}</span>
                                    </div>
                                </Button>
                            </ButtonGroup>
                            {/* Animated background pill */}
                            <div
                                className={cn(
                                    "absolute top-1 bottom-1 w-[calc(50%)] rounded-full bg-white dark:bg-default-700 transition-all duration-300",
                                    isDelivery ? "translate-x-[calc(100%)]" : "translate-x-[1px]"
                                )}
                                style={{
                                    left: 0
                                }}
                            />
                        </div>
                    </div>
                 {/* {!isMobile && (
                    <Button
                        className="min-w-0 h-10 px-4 rounded-full bg-transparent"
                        variant="bordered"
                        startContent={
                            <Icon
                                className="text-default-500"
                                height={24}
                                icon="solar:map-point-linear"
                                width={24}
                            />
                        }
                    >
                        {store?.location?.city || "Address"}
                    </Button>
                )} */}
            </NavbarBrand>

            <NavbarContent className="flex flex-row-reverse gap-4 justify-end">
            {/* <LanguageModal/> */}
                {session?.user ? (
                    <Avatar 
                        isBordered
                        size="sm"
                        src={session.user.picture || ""} 
                        name={session.user.username || "User"}
                        color="primary"
                        className="cursor-pointer"
                        onClick={() => router.push("/profile")}
                    />
                ) : (
                    <SigninButton className="min-w-0" />
                )}
                {store && !isMobile && (
                    <CartButton />
                )}
                <Button
                    isIconOnly
                    variant="light"
                    size="sm"
                    className="min-w-0"
                    onPress={() => setIsLanguageOpen(true)}
                >
                    <Icon icon="material-symbols-light:language" width={32} height={32} />
                </Button>
            </NavbarContent>
            {isLanguageOpen && <LanguageModal handAction={() => setIsLanguageOpen(false)}/>}
        </>
    );
    
};

const MobileNavbar: React.FC = () => {


    return (
        <div className="flex flex-col w-full justify-around items-center px-2">
            <CartButton 
                isMobileNavbar={true}
            />
            <SelectTime />
        </div>
    );
};

