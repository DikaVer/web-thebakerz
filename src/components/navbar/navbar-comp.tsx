"use client";

import type { NavbarProps } from "@heroui/react";
import React from "react";
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
import {usePathname, useRouter} from "next/navigation";
import { useSession } from "@/components/providers/session-provider";
import {useTranslations} from "next-intl";
import {SessionValidationResult} from "@/lib/actions/session";
import { JoinButton } from "../ui/join-button";

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


export default function NavbarComponent({
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
    const isSmall = useMediaQuery("(max-width: 1024px)");
    const { isSticky } = store ? useStore() : { isSticky: false };
    const { session } = useSession();
    const router = useRouter();
    const storeUrl = store?.storeName ? store?.storeName : store?.id;

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
                    base: "sticky py-4 w-full backdrop-filter-none bg-transparent",
                    wrapper:
                        "px-4 w-full justify-center bg-transparent max-w-[1400px]",
                    item: "hidden md:flex",
                }}
                className="z-40"
                height="54px"
            >
                <NavbarContent
                    className={`flex data-[justify=center]:justify-between w-full gap-8 rounded-full ${
                        isSticky ? "rounded-3xl rounded-b-none" : ""
                    } border-small border-default-200/20 px-2 shadow-medium backdrop-blur-xl`}
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
                            isSmall={isSmall}
                            setIsCollapsed={setIsCollapsed}
                            onOpenChange={onOpenChange}
                            onToggle={onToggle}
                            store={store}
                            session={session}
                            navigateToStore={navigateToStore}
                            t={t}
                        />
                    )}
                </NavbarContent>
            </Navbar>
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

    return (
        <>
            <NavbarItem className="ml-1 !flex">
                <Button
                    size="md"
                    variant="light"
                    className="text-default-500"
                    onPress={store ? navigateToStore : () => router.back()}
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

                    :(
                        <Image
                            src="/images/TheBakerzLogo.svg"
                            alt="Logo"
                            width={32}
                            radius="full"
                        />
                    )}
            </NavbarItem>
        </>
    );
};

interface DefaultNavbarProps extends NavbarTranslationProps {
    isSmall: boolean;
    setIsCollapsed: (value: boolean) => void;
    onOpenChange: () => void;
    onToggle: () => void;
    store?: StoreData;
    session: SessionValidationResult;
    navigateToStore: () => void;
}

const DefaultNavbar: React.FC<DefaultNavbarProps> = ({
                                                         isSmall,
                                                         setIsCollapsed,
                                                         onOpenChange,
                                                         onToggle,
                                                         store,
                                                         session,
                                                         navigateToStore,
    t
                                                     }) => {

    const pathname = usePathname();
    const isPartnerPage = pathname.includes("/become-partner");

    return (
        <>
            <NavbarItem className="ml-1 !flex">
                <Button
                    isIconOnly
                    size="sm"
                    variant="light"
                    onPress={() => {
                        if (isSmall) {
                            setIsCollapsed(false);
                            onOpenChange();
                        } else {
                            onToggle();
                        }
                    }}
                >
                    <Icon
                        className="text-default-600"
                        icon="line-md:close-to-menu-transition"
                        width={24}
                    />
                </Button>
            </NavbarItem>
            <NavbarBrand className="w-[40rem] max-w-fit">
                <a
                    className={`font-medium text-2xl ${pacifico.className}`}
                    href={store?.ownerName ? `/${store?.storeName}` : "/"}
                >
                    {store?.ownerName || t("brandName")}
                </a>
            </NavbarBrand>
            {store ? (
                (session?.user?.id === store.user_id || session?.user?.role === 'admin') ? (
                    <a href={process.env.NEXT_PUBLIC_API_BASE_URL}>
                        <Image
                            src="/images/TheBakerzLogo.svg"
                            alt="Logo"
                            width={32}
                            radius="full"
                        />
                    </a>
                ) : (
                    <NavbarItem className="mr-1 !flex">
                        <CartButton />
                    </NavbarItem>
                )
            ) : (
                <NavbarItem className="mr-1 !flex">
                    {!session?.session ? (
                        isPartnerPage ? (
                            <JoinButton />
                        ) : (
                            <SigninButton className="text-large rounded-full" />
                        )
                    ) : (
                        <Image
                        src="/images/TheBakerzLogo.svg"
                        alt="Logo"
                        width={32}
                        radius="full"
                         />
                    )}
                </NavbarItem>
            )}
        </>
    );
};
