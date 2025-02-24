import {AvatarIcon, Button, cn, Image, Spacer, Tooltip} from "@heroui/react";
import {Avatar} from "@heroui/avatar"
import {pacifico} from "@/components/fonts";
import {ScrollShadow} from "@heroui/scroll-shadow";
import Sidebar from "@/components/sidebar/sidebar";
import {Icon} from "@iconify/react";
import SidebarDrawer from "@/components/sidebar/sidebar-drawer";
import React, {useEffect} from "react";
import {usePathname, useRouter} from "next/navigation";
import {ThemeSwitcher} from "@/components/ui/theme-switcher";
import {SignOutButton} from "@/components/ui/signout-button";
import {
    sectionItemsAdmin,
    sectionItemsBakerz, sectionItemsGuestStore,
    sectionItemsGuestTheBakerz, sectionItemsTheBakerz,
    sectionItemsUser, sectionStoreItemsUser
} from "@/components/sidebar/sidebar-items";
import {useTheme} from "next-themes";
import {useSession} from "@/components/providers/session-provider";
import {SessionValidationResult} from "@/lib/actions/session";
import {StoreData} from "@/lib/actions/store";



interface SidebarMenuProps {
    store?: StoreData
    isOpen: boolean;
    onOpenChange: () => void;
    isCollapsed: boolean;
    isMobile: boolean;
}

export default function SidebarMenu({store, isOpen, onOpenChange, isCollapsed}: SidebarMenuProps) {
    const pathname = usePathname();
    const router = useRouter();
    const currentPath = pathname.split("/")?.[1]

    const { session } = useSession();

    useEffect(() => {
        if (isOpen) {
            onOpenChange();
        }
    }, [pathname]);

    const { theme } = useTheme();


    return (
        <SidebarDrawer
            className={cn("min-w-[240px] rounded-lg", {"min-w-[64px]": isCollapsed})}
            hideCloseButton={true}
            isOpen={isOpen}
            onOpenChange={onOpenChange}
        >
            <div
                className={cn(
                    `fixed will-change flex h-full w-60 rounded-r-lg flex-col px-2 py-6 transition-width border-r bg-background`,
                    {
                        "w-[64px] items-center px-[6px] py-6": isCollapsed,
                    },
                )}
            >
                <a
                    className={cn("flex items-center gap-3 pl-2 ", {
                        "justify-center gap-0 pl-0": isCollapsed,
                    })}
                    href={store ? `/${store.storeName}` : "/"}
                >
                    {store ? (
                        <></>
                    ) : (
                        <>
                            <Image
                                src={`/images/TheBakerzLogo.svg`}
                                alt="Logo"
                                width={isCollapsed ? 48 : 64}
                                height={64}
                            />
                            <span
                                className={cn(
                                    "block w-[300px] text-3xl opacity-100 " +
                                    pacifico.className +
                                    " truncate",
                                    {"w-0 opacity-0": isCollapsed}
                                )}

                            >
                                {"TheBakerz"}
                            </span>
                        </>
                    )
                    }

                </a>

                <ScrollShadow className="-mr-6 h-full max-h-full py-6 pr-6">
                    <Sidebar
                        defaultSelectedKey="home"
                        selectedKeys={[currentPath]}
                        iconClassName="group-data-[selected=true]:text-text"
                        isCompact={isCollapsed}
                        itemClasses={{
                            base: "px-3 rounded-large data-[selected=true]:shadow ",
                            title: "group-data-[selected=true]:text-text",
                        }}
                        items={getItemsByRole(session, !!store)}
                    />
                </ScrollShadow>

                <Spacer y={8}/>

                <div
                    className={cn("mt-auto flex flex-col", {
                        "items-center": isCollapsed,
                    })}
                >
                    <div className={`${isCollapsed && 'hidden'} flex flex-row-reverse w-full`}>
                        <ThemeSwitcher/>
                    </div>
                    <Spacer y={3}/>
                    <hr/>
                    <Spacer y={2}/>
                    {session.user ?
                        <LoggedInMenu
                            name={session.user.username}
                            isCollapsed={isCollapsed}
                            theme={theme === 'light'}
                            picture={session.user.picture}
                        />
                        :
                        <GuestMenu
                            isCollapsed={isCollapsed}
                        />
                    }

                    <Spacer y={2}/>
                    <hr/>
                    <Spacer y={3}/>
                    <Tooltip
                        content="Support" isDisabled={!isCollapsed}
                        placement="right">
                        <Button
                            fullWidth
                            className={cn(
                                "justify-start truncate text-grayText data-[hover=true]:text-foreground data-[hover=true]:bg-default/40",
                                {
                                    "justify-center": isCollapsed,
                                },
                            )}
                            isIconOnly={isCollapsed}
                            startContent={
                                isCollapsed ? null : (
                                    <Icon
                                        className="flex-none text-grayText"
                                        icon="solar:info-circle-line-duotone"
                                        width={24}
                                    />
                                )
                            }
                            variant="light"
                            onPress={() => {
                                router.push(`/support`)
                                router.refresh()
                            }}
                        >
                            {isCollapsed ? (
                                <Icon
                                    className="text-grayText"
                                    icon="solar:info-circle-line-duotone"
                                    width={24}
                                />
                            ) : (
                                "Get Help"
                            )}
                        </Button>
                    </Tooltip>
                    {
                        session.user &&
                        <SignOutButton
                            isCollapsed={isCollapsed}
                        />
                    }
                </div>
            </div>
        </SidebarDrawer>
    );
}

const getItemsByRole = (session: SessionValidationResult, store: boolean) => {

    if (!session.user) {
        if (store) {
            return sectionItemsGuestStore;
        }
        return sectionItemsGuestTheBakerz;
    }

    const role = session.user.role;
    switch (role) {
        case 'admin':
            return sectionItemsAdmin;
        case 'user':
            {
                if (store) {
                    return sectionStoreItemsUser;
                }
                return sectionItemsUser;
            }
        case 'bakerz':
            return [
                {
                    key: "account",
                    title: "Account",
                    items: [
                        {
                            key: "orders",
                            href: `/${session.store?.storeName}/orders`,
                            title: "Orders",
                            icon: "solar:notification-unread-lines-broken",
                        },
                        {
                            key: "store",
                            href: `/${session.store?.storeName}`,
                            icon: "solar:shop-broken",
                            title: `${session.user.username}`,
                        },
                        {
                            key: "payments",
                            href: `/${session.store?.storeName}/payments`,
                            icon: "solar:wallet-money-broken",
                            title: "Payments",
                        },
                    ],
                },
                ...sectionItemsBakerz
                ];
        default:
            return sectionItemsGuestTheBakerz;
    }
};

interface LoggedInMenuProps {
    name: string;
    picture?: string;
    isCollapsed: boolean;
    theme: boolean;
}

const LoggedInMenu: React.FC<LoggedInMenuProps> = ({ theme, name, picture, isCollapsed}) => (
    <>
        <Tooltip content="Account Settings" isDisabled={!isCollapsed} placement="right">
            <a
                className="flex items-center gap-3 px-3 py-1.5 hover:bg-default/40 rounded-xl cursor-pointer"
                href={"/settings"}
            >
                <Avatar
                    alt="Avatar"
                    isBordered
                    showFallback={!!picture}
                    size="sm"
                    name={name}
                    src={picture}
                    color={'secondary'}
                    classNames={{
                        base: "bg-default text-text shadow-lg",
                    }}
                />
                <div className={cn("flex max-w-full flex-col", {hidden: isCollapsed})}>
                    <p className="text-small font-medium text-foreground truncate max-w-40">{name}</p>
                    <p className="text-tiny font-medium text-grayText">Account Settings</p>
                </div>
            </a>
        </Tooltip>
    </>
);


interface GuestMenuProps {
    isCollapsed: boolean;
}

const GuestMenu: React.FC<GuestMenuProps> = ({isCollapsed}) => {
    const pathname = usePathname();
    return (
        <Tooltip content="Account Settings" isDisabled={!isCollapsed} placement="right">
            <a
                className="flex items-center gap-3 px-3 py-1.5 hover:bg-default/40 rounded-xl cursor-pointer"
                href={`/auth?next=${pathname}`}
            >
                <Avatar
                    icon={<AvatarIcon
                    />}
                    isBordered
                    size="sm"
                    classNames={{
                        base: "",
                        icon: "text-default-700",
                    }}
                />
                <div className={cn("flex max-w-full flex-col", {hidden: isCollapsed})}>
                    <p className="text-small font-medium text-foreground">Welcomed Guest</p>
                    <p className="text-tiny font-medium text-grayText">Sign in</p>
                </div>
            </a>
        </Tooltip>
    );
};