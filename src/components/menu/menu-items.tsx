"use server";

import React from "react";
import {
    IconAboutUs,
    IconAvatar,
    IconBill,
    IconChefHat,
    IconHome,
    IconPayment, IconSearch,
    IconSupport
} from "@/components/ui/icons";
import {SignoutButton} from "@/components/ui/signout-button";
import {ThemeSwitcher} from "@/components/ui/ThemeSwitcher";
import {Avatar, AvatarIcon} from "@nextui-org/react";
import {pacifico} from "@/components/fonts";


interface MenuItemsProps {
    login: boolean;  // Specifies if the user is logged in
    role: string | undefined;  // Role of the user (e.g., admin, user)
    name: string | undefined | null;  // Name of the user
}

export async function MenuItems({ login, name, role }: MenuItemsProps) {
    return (
        <div className="min-h-screen border-r w-[16rem] shadow-lg z-20">
            <div className="fixed top-5 desktop:top-16 bg-background left-0 flex flex-col justify-between h-full px-2">
                {/* Header */}
                <header className="block desktop:hidden">
                    <a
                        href="/"
                        className={`text-3xl ml-7 animate-fadeInDown mx-auto ${pacifico.className}`}
                    >
                        TheBakerz
                    </a>
                    <hr className="my-2" />
                </header>

                {/* Content */}
                <main className="flex-grow desktop:mt-2 overflow-y-auto">
                    <ul className="space-y-2">
                        <MenuItem icon={IconHome} label="Home" link="/" />
                        <MenuItem
                            icon={IconSearch}
                            label="Search Bakerz"
                            subtitle={"Coming Soon!"}
                            link="/search"
                        />
                        <MenuItem icon={IconChefHat} label="Become Bakerz" link="/application" />
                        <MenuItem icon={IconAboutUs} label="About Us" link="/about-us" />
                    </ul>
                    <hr className="my-2" />
                    {login ? (
                        <>
                            <ul className="space-y-2">
                                <MenuItem icon={IconBill} label="Orders" link="/orders" />
                                <MenuItem icon={IconPayment} label="Payment" link="/payments" />
                                <MenuItem icon={IconSupport} label="Get Help" link="/support" />
                            </ul>
                            <hr className="my-2" />
                            <SignoutButton className="ml-4 text-grayText py-4" />
                        </>
                    ) : (
                        <ul className="space-y-2">
                            <MenuItem icon={IconSupport} label="Get Help" link="/support" />
                        </ul>
                    )}
                </main>

                {/* Footer */}
                <footer className="desktop:mb-24">
                    <hr className="my-1" />
                    {login ? <LoggedInMenu name={name} /> : <GuestMenu />}
                    <hr className="my-1" />
                    <ThemeSwitcher />
                </footer>
            </div>
        </div>
    );
}

interface LoggedInMenuProps {
    name?: string | null;
}

const LoggedInMenu: React.FC<LoggedInMenuProps> = ({ name}) => (
    <>
        <a
            className="flex flex-row items-center space-x-3 p-2 trigger-hover cursor-pointer hover:bg-grayBg rounded-2xl mr-2"
            href={"settings"}
        >
            <Avatar
                icon={<AvatarIcon/>}
                className={"w-14-5 w-14-5 "}
                classNames={{
                    base: "bg-gradient-to-br from-primary to-secondary",
                    icon: "text-black/80",
                }}
            />
            <div>
                <p className="text-lg">{name}</p>
                <p className="text-grayText">email@gmail.com</p>
            </div>
        </a>
    </>
);



const GuestMenu = () => (
    <>
        <a className="flex flex-row items-center space-x-3 p-2 hover:bg-grayBg rounded-2xl mr-2"
           href={"/auth"}
        >
            <Avatar
                icon={<AvatarIcon/>}
                className={"w-14-5 w-14-5 "}
                classNames={{
                    base: "bg-gradient-to-br from-primary to-secondary",
                    icon: "text-black/80",
                }}
            />
            <div className="grid gap-1 -mt-1">
                <p className="text-lg">Guest</p>
                <p className="text-grayText scale-on-hover-105"
                >
                    Sign In
                </p>
            </div>
        </a>
    </>
);

interface MenuItemProps {
    icon: React.ElementType;
    label: string;
    subtitle?: string;
    link: string;
}

const MenuItem: React.FC<MenuItemProps> = ({ icon: Icon, label, link, subtitle }) => (
    <li>
        <a className="flex flex-row items-center space-x-3 hover:bg-grayBg rounded-2xl pr-12 p-2" href={link}>
            <Icon className="w-8 h-8 text-text"/>
            <div className={"flex flex-col"}>
                <span className={`text-lg flex items-center ${!subtitle && "h-[48px]"}`}>
                    {label}
                </span>
                <span className={`text-md text-primary ${pacifico.className}`}>
                    {subtitle}
                </span>
            </div>
        </a>
    </li>
);
