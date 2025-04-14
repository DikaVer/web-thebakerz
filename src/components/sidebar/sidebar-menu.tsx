// TypeScript
import { AvatarIcon, Button, cn, Image, Spacer, Tooltip, Avatar, ScrollShadow } from "@heroui/react";
import { pacifico } from "@/components/fonts";
import Sidebar, {SidebarItemType} from "@/components/sidebar/sidebar";
import { Icon } from "@iconify/react";
import SidebarDrawer from "@/components/sidebar/sidebar-drawer";
import React, { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { ThemeSwitcher } from "@/components/ui/theme-switcher";
import { SignOutButton } from "@/components/ui/signout-button";
import {
    sectionItemsAdmin,
    sectionItemsBakerz,
    sectionItemsGuestStore,
    sectionItemsGuestTheBakerz,
    sectionItemsTheBakerz,
    sectionItemsUser,
    sectionStoreItemsUser
} from "@/components/sidebar/sidebar-items";
import { useTheme } from "next-themes";
import { useSession } from "@/components/providers/session-provider";
import { SessionValidationResult } from "@/lib/actions/session";
import { StoreData } from "@/lib/actions/store";
import { useTranslations } from "next-intl";

interface SidebarMenuProps {
    store?: StoreData;
    isOpen: boolean;
    onOpenChange: () => void;
    isCollapsed: boolean;
    isMobile: boolean;
}


export default function SidebarMenu({ store, isOpen, onOpenChange, isCollapsed }: SidebarMenuProps) {
    const t = useTranslations("app/(landing)/components/sidebar-menu");
    const pathname = usePathname();
    const router = useRouter();
    const currentPath = pathname.split("/")?.[1];
    const { session } = useSession();

    useEffect(() => {
        if (isOpen) {
            onOpenChange();
        }
    }, [pathname]);

    const { theme } = useTheme();
    const storeUrl = null;




    return (
        <SidebarDrawer
            className={cn("min-w-[240px] rounded-lg", { "min-w-[64px]": isCollapsed })}
            hideCloseButton={true}
            isOpen={isOpen}
            onOpenChange={onOpenChange}
        >
            <div
                className={cn(
                    `fixed will-change flex h-full w-60 rounded-r-lg flex-col px-2 py-6 transition-width border-r bg-background`,
                    { "w-[64px] items-center px-[6px] py-6": isCollapsed }
                )}
            >
                <a
                    className={cn("flex items-center gap-3 pl-2", { "justify-center gap-0 pl-0": isCollapsed })}
                    href={store ? `/${storeUrl}` : "/"}
                >
                    {store ? (
                        <></>
                    ) : (
                        <>
                            <Image src={`/images/TheBakerzLogo.svg`} alt="Logo" width={isCollapsed ? 48 : 64} height={64} />
                            <span
                                className={cn(
                                    "block w-[300px] text-3xl opacity-100 " + pacifico.className + " truncate",
                                    { "w-0 opacity-0": isCollapsed }
                                )}
                            >
                {t("appName")}
              </span>
                        </>
                    )}
                </a>

                <ScrollShadow className="-mr-6 h-full max-h-full py-6 pr-6">
                    <Sidebar
                        defaultSelectedKey="home"
                        selectedKeys={[currentPath]}
                        iconClassName="group-data-[selected=true]:text-text"
                        isCompact={isCollapsed}
                        itemClasses={{
                            base: "px-3 rounded-large data-[selected=true]:shadow",
                            title: "group-data-[selected=true]:text-text"
                        }}
                        items={getItemsByRole(session, t, store)}
                    />
                </ScrollShadow>

                <Spacer y={8} />

                <div className={cn("mt-auto flex flex-col", { "items-center": isCollapsed })}>
                    <div className={`${isCollapsed && "hidden"} flex flex-row-reverse w-full`}>
                        <ThemeSwitcher />
                    </div>
                    <Spacer y={3} />
                    <hr />
                    <Spacer y={2} />
                    {session.user ? (
                        <LoggedInMenu name={session.user.username} isCollapsed={isCollapsed} theme={theme === "light"} picture={session.user.picture} />
                    ) : (
                        <GuestMenu isCollapsed={isCollapsed} />
                    )}
                    <Spacer y={2} />
                    <hr />
                    <Spacer y={3} />
                    <Tooltip content={t("support")} isDisabled={!isCollapsed} placement="right">
                        <Button
                            fullWidth
                            className={cn(
                                "justify-start truncate text-grayText data-[hover=true]:text-foreground data-[hover=true]:bg-default/40",
                                { "justify-center": isCollapsed }
                            )}
                            isIconOnly={isCollapsed}
                            startContent={
                                isCollapsed ? null : (
                                    <Icon className="flex-none text-grayText" icon="solar:info-circle-line-duotone" width={24} />
                                )
                            }
                            variant="light"
                            onPress={() => {
                                router.push(`/support`);
                                router.refresh();
                            }}
                        >
                            {isCollapsed ? (
                                <Icon className="text-grayText" icon="solar:info-circle-line-duotone" width={24} />
                            ) : (
                                t("getHelp")
                            )}
                        </Button>
                    </Tooltip>
                    {session.user && <SignOutButton isCollapsed={isCollapsed} />}
                </div>
            </div>
        </SidebarDrawer>
    );
}

const getItemsByRole = (session: SessionValidationResult, t: any, store?: StoreData) => {
    // Helper function to apply translations to items
    const applyTranslations = (items: any[]): any[] => {
        return items.map(item => {
            const translatedItem = { ...item };

            if (translatedItem.titleKey) {
                translatedItem.title = t(translatedItem.titleKey);
                delete translatedItem.titleKey; // Remove the key after translation
            }

            if (translatedItem.items) {
                translatedItem.items = applyTranslations(translatedItem.items);
            }

            return translatedItem;
        });
    };

    let sidebarItems;

    if (!session.user) {
        if (store) {
            const storeUrl = store?.storeName ? store?.storeName : store?.id;
            return applyTranslations([
                {
                    key: "",
                    href: `/auth?next=${storeUrl}`,
                    icon: "line-md:login",
                    titleKey: "signInButton"
                },
                ...sectionItemsGuestStore
            ]);
        }
        sidebarItems = sectionItemsGuestTheBakerz;
    } else {
        const role = session.user.role;
        const storeUrl = null;
        switch (role) {
            case "admin":
                sidebarItems = sectionItemsAdmin;
                break;
            case "user":
                sidebarItems = store ? sectionStoreItemsUser : sectionItemsUser;
                break;
            case "bakerz":
                sidebarItems = 
                    // If there's only one store, show its items directly
                    session.stores && session.stores.length === 1 
                    ? [
                        {
                            key: "account",
                            titleKey: "account",
                            items: [
                                            
                                    {
                                        key: `store_shop-${session.stores[0].id}`,
                                        href: `/${session.stores[0].name || session.stores[0].id}`,
                                        title: session.stores[0].name || session.stores[0].id,
                                        icon: "solar:shop-minimalistic-linear"
                                    },
                                    {
                                        key: `orders-${session.stores[0].id}`,
                                        href: `/${session.stores[0].name || session.stores[0].id}/orders`,
                                        titleKey: "orders",
                                        icon: "solar:notification-unread-lines-broken"
                                    },
                                    {
                                        key: `products-${session.stores[0].id}`,
                                        href: `/${session.stores[0].name || session.stores[0].id}/products`,
                                        icon: "solar:bag-5-broken",
                                        titleKey: "products"
                                    },
                                    {
                                        key: `settings-${session.stores[0].id}`,
                                        href: `/${session.stores[0].name || session.stores[0].id}/settings`,
                                        icon: "solar:settings-linear",
                                        titleKey: "settings"
                                    }
                                ],
                        },
                        ...sectionItemsBakerz
                    ]
                    // Otherwise use the nested structure
                    : [
                    {
                        key: "stores",
                        titleKey: "stores",
                        items: session.stores && session.stores.length > 0 ? session.stores.map(store => {
                            const storeUrl = store.name || store.id;
                            return {
                                key: `store-${store.id}`,
                                icon: "solar:shop-broken",
                                title: storeUrl,
                                type: SidebarItemType.Nest,
                                items: [
                                    {
                                        key: `store_shop-${store.id}`,
                                        href: `/${storeUrl}`,
                                        titleKey: "shop",
                                        icon: "solar:shop-minimalistic-linear"
                                    },
                                    {
                                        key: `orders-${store.id}`,
                                        href: `/${storeUrl}/orders`,
                                        titleKey: "orders",
                                        icon: "solar:notification-unread-lines-broken"
                                    },
                                    {
                                        key: `products-${store.id}`,
                                        href: `/${storeUrl}/products`,
                                        icon: "solar:bag-5-broken",
                                        titleKey: "products"
                                    },
                                    {
                                        key: `settings-${store.id}`,
                                        href: `/${storeUrl}/settings`,
                                        icon: "solar:settings-linear",
                                        titleKey: "settings"
                                    },
                                ],
                            };
                        }) : [],
                    },
                    ...sectionItemsBakerz
                ];
                break;
            default:
                sidebarItems = sectionItemsGuestTheBakerz;
        }
    }

    return applyTranslations(sidebarItems);
};

interface LoggedInMenuProps {
    name: string;
    picture?: string;
    isCollapsed: boolean;
    theme: boolean;
}

const LoggedInMenu: React.FC<LoggedInMenuProps> = ({ theme, name, picture, isCollapsed }) => {
    const t = useTranslations("app/(landing)/components/sidebar-menu");
    return (
        <Tooltip content={t("accountSettings")} isDisabled={!isCollapsed} placement="right">
            <a className="flex items-center gap-3 px-3 py-1.5 hover:bg-default/40 rounded-xl cursor-pointer" href={"/settings"}>
                <Avatar
                    alt="Avatar"
                    isBordered
                    showFallback={!!picture}
                    size="sm"
                    name={name}
                    src={picture}
                    color={"secondary"}
                    classNames={{
                        base: "bg-default text-text shadow-lg"
                    }}
                />
                <div className={cn("flex max-w-full flex-col", { hidden: isCollapsed })}>
                    <p className="text-small font-medium text-foreground truncate max-w-40">{name}</p>
                    <p className="text-tiny font-medium text-grayText">{t("accountSettings")}</p>
                </div>
            </a>
        </Tooltip>
    );
};

interface GuestMenuProps {
    isCollapsed: boolean;
}

const GuestMenu: React.FC<GuestMenuProps> = ({ isCollapsed }) => {
    const t = useTranslations("app/(landing)/components/sidebar-menu");
    const pathname = usePathname();
    return (
        <Tooltip content={t("accountSettings")} isDisabled={!isCollapsed} placement="right">
            <a className="flex items-center gap-3 px-3 py-1.5 hover:bg-default/40 rounded-xl cursor-pointer" href={`/auth?next=${pathname}`}>
                <Avatar
                    icon={<AvatarIcon />}
                    isBordered
                    size="sm"
                    classNames={{
                        base: "",
                        icon: "text-default-700"
                    }}
                />
                <div className={cn("flex max-w-full flex-col", { hidden: isCollapsed })}>
                    <p className="text-small font-medium text-foreground">{t("welcomedGuest")}</p>
                    <p className="text-tiny font-medium text-grayText">{t("signIn")}</p>
                </div>
            </a>
        </Tooltip>
    );
};