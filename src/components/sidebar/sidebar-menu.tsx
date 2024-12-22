import {Avatar, AvatarIcon, Button, cn, Image, Spacer, Tooltip} from "@nextui-org/react";
import {pacifico} from "@/components/fonts";
import {ScrollShadow} from "@nextui-org/scroll-shadow";
import Sidebar from "@/components/sidebar/sidebar";
import {Icon} from "@iconify/react";
import SidebarDrawer from "@/components/sidebar/sidebar-drawer";
import React, {useEffect} from "react";
import {usePathname, useRouter, useSearchParams} from "next/navigation";
import {ThemeSwitcher} from "@/components/ui/ThemeSwitcher";
import {SignOutButton} from "@/components/ui/signout-button";
import {
    sectionItemsAdmin,
    sectionItemsBakerz,
    sectionItemsGuest,
    sectionItemsUser
} from "@/components/sidebar/sidebar-items";


interface SidebarMenuProps {
    isOpen: boolean;
    onOpenChange: () => void;
    isCollapsed: boolean;
    isMobile: boolean;
    session: {
        login: boolean;  // Specifies if the user is logged in
        role: string | undefined;  // Role of the user (e.g., admin, user)
        name: string | undefined | null;  // Name of the user
    }
}

export default function SidebarMenu({ isOpen, onOpenChange, isCollapsed, session}: SidebarMenuProps) {
    const pathname = usePathname();
    const router = useRouter();
    const currentPath = pathname.split("/")?.[1]

    useEffect(() => {
        if (isOpen) {
            onOpenChange();
        }
    }, [pathname]);


    return (
        <SidebarDrawer
            className={cn("min-w-[288px] rounded-lg", {"min-w-[82px]": isCollapsed})}
            hideCloseButton={true}
            isOpen={isOpen}
            onOpenChange={onOpenChange}
        >
            <div
                className={cn(
                    `fixed will-change flex h-full w-72 flex-col  p-6 transition-width border-r bg-background`,
                    {
                        "w-[83px] items-center px-[6px] py-6": isCollapsed,
                    },
                )}
            >
                <a
                    className={cn("flex items-center gap-3 pl-2", {
                        "justify-center gap-0 pl-0": isCollapsed,
                    })}
                    href="/"
                >
                    <Image
                        src={`/images/TheBakerzLogo.svg`}
                        width={isCollapsed ? 48 : 64}
                        height={64}
                    />
                    <span
                        className={cn(`w-full text-3xl  opacity-100 ${pacifico.className}`, {
                            "w-0 opacity-0": isCollapsed,
                        })}
                    >
                            TheBakerz
                        </span>
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
                        items={getItemsByRole(session.role ?? "")}
                    />
                </ScrollShadow>

                <Spacer y={8}/>

                <div
                    className={cn("mt-auto flex flex-col", {
                        "items-center": isCollapsed,
                    })}
                >
                    <div className={cn({hidden: isCollapsed})}>
                        <ThemeSwitcher/>
                    </div>
                    <Spacer y={3}/>
                    <hr/>
                    <Spacer y={2}/>
                    {session.login ?
                        <LoggedInMenu
                            name={session.name}
                            isCollapsed={isCollapsed}
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
                                    className="text-text-grayText"
                                    icon="solar:info-circle-line-duotone"
                                    width={24}
                                />
                            ) : (
                                "Get Help"
                            )}
                        </Button>
                    </Tooltip>
                    {
                        session.login &&
                        <SignOutButton
                            isCollapsed={isCollapsed}
                        />
                    }
                </div>
            </div>
        </SidebarDrawer>
    );
}

const getItemsByRole = (role : string) => {
    switch (role) {
        case 'admin':
            return sectionItemsAdmin;
        case 'user':
            return sectionItemsUser;
        case 'bakerz':
            return sectionItemsBakerz;
        default:
            return sectionItemsGuest;
    }
};

interface LoggedInMenuProps {
    name?: string | null;
    image?: string;
    isCollapsed: boolean;
}

const LoggedInMenu: React.FC<LoggedInMenuProps> = ({ name, image, isCollapsed}) => (
    <>
        <Tooltip content="Account Settings" isDisabled={!isCollapsed} placement="right">
            <a
                className="flex items-center gap-3 px-3 py-1.5 hover:bg-default/40 rounded-xl cursor-pointer"
                href={"/settings"}
            >
                <Avatar
                    icon={<AvatarIcon/>}
                    isBordered
                    size="sm"
                    src={image}
                    classNames={{
                        base: "bg-gradient-to-br from-primary to-secondary",
                        icon: "text-black/80",
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
                    icon={<AvatarIcon/>}
                    isBordered
                    size="sm"
                    classNames={{
                        base: "bg-gradient-to-br from-primary to-secondary",
                        icon: "text-black/80",
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