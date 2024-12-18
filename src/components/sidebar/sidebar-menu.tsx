import {Avatar, AvatarIcon, Button, cn, Image, Spacer, Tooltip} from "@nextui-org/react";
import {pacifico} from "@/components/fonts";
import {ScrollShadow} from "@nextui-org/scroll-shadow";
import Sidebar from "@/components/sidebar/sidebar";
import {Icon} from "@iconify/react";
import SidebarDrawer from "@/components/sidebar/sidebar-drawer";
import React from "react";
import {usePathname, useRouter} from "next/navigation";
import {ThemeSwitcher} from "@/components/ui/ThemeSwitcher";
import {SignOutButton} from "@/components/ui/signout-button";
import {sectionItemsUser} from "@/components/sidebar/sidebar-items";


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


    return (
        <SidebarDrawer
            className={cn("min-w-[288px] rounded-lg", {"min-w-[82px]": isCollapsed})}
            hideCloseButton={true}
            isOpen={isOpen}
            onOpenChange={onOpenChange}
        >
            <div
                className={cn(
                    `fixed will-change flex h-full w-72 flex-col  p-6 transition-width border-1`,
                    {
                        "w-[83px] items-center px-[6px] py-6": isCollapsed,
                    },
                )}
            >
                <div
                    aria-hidden="true"
                    className="absolute inset-x-0 -top-40 -z-10 transform-gpu overflow-hidden blur-3xl sm:-top-80"
                >
                    <div
                        style={{
                            clipPath:
                                'polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)',
                        }}
                        className="relative left-[calc(30%-11rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 rotate-[30deg] bg-gradient-to-tr from-[#ff80b5] to-[#9089fc] opacity-30 sm:left-[calc(10%-30rem)] sm:w-[72.1875rem]"
                    />
                </div>
                <div
                    aria-hidden="true"
                    className="absolute inset-x-0 top-[calc(60%-13rem)] -z-10 transform-gpu overflow-hidden blur-3xl sm:top-[calc(65%-30rem)]"
                >
                    <div
                        style={{
                            clipPath:
                                'polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)',
                        }}
                        className="relative left-[calc(30%-10rem)] aspect-[1155/478] w-[36.125rem] -translate-x-1/2 rotate-[30deg] bg-gradient-to-tr from-[#ff80b5] to-[#9089fc] opacity-30 sm:w-[73rem]"
                    />
                </div>
                <div
                    aria-hidden="true"
                    className="absolute inset-x-0 top-[calc(80%-13rem)] -z-10 transform-gpu overflow-hidden blur-3xl sm:top-[calc(80%-30rem)]"
                >
                    <div
                        style={{
                            clipPath:
                                'polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)',
                        }}
                        className="relative aspect-[1155/778] w-[36.125rem] -translate-x-1/2 bg-gradient-to-tr from-[#ff80b5] to-[#9089fc] opacity-30 left-[calc(40%)] sm:w-[72.1875rem]"
                    />
                </div>
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
                            base: "px-3 rounded-large data-[selected=true]:shadow",
                            title: "group-data-[selected=true]:text-text",
                        }}
                        items={sectionItemsUser}
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