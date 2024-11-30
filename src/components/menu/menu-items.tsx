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
import {SigninButton} from "@/components/ui/signin-button";
import {SignoutButton} from "@/components/ui/signout-button";
import {ThemeSwitcher} from "@/components/ui/ThemeSwitcher";
import {SidebarFooter} from "@/components/ui/sidebar";
import {Avatar, AvatarIcon} from "@nextui-org/react";
import {pacifico} from "@/components/fonts";


interface MenuItemsProps {
    login: boolean;  // Specifies if the user is logged in
    role: string | undefined;  // Role of the user (e.g., admin, user)
    name: string | undefined | null;  // Name of the user
}

export async function MenuItems({ login, name, role }: MenuItemsProps) {
    return (
        <div className="desktop:mt-16 min-h-svh ml-2 flex flex-col justify-between">

            <header className={"block desktop:hidden mt-4"}>
                <a href="/" className={`text-3xl ml-7 animate-fadeInDown mx-auto ${pacifico.className}`}>TheBakerz</a>
                <hr className="my-4"/>
            </header>

            {/* Content */}
            <main className="flex-grow desktop:mt-6">
                <ul className="grid gap-6">
                    <MenuItem icon={IconHome} label="Home" link="/"/>
                    <MenuItem icon={IconSearch} label="Search Bakerz" subtitle={"Coming Soon!"} link="/search"/>
                    <MenuItem icon={IconChefHat} label="Become Bakerz" link="/application"/>
                    <MenuItem icon={IconAboutUs} label="About Us" link="/about-us"/>
                </ul>
                <hr className="my-4"/>
                {login ? (
                    <>
                        <ul className="grid gap-6">
                            <MenuItem icon={IconBill} label="Orders" link="/orders"/>
                            <MenuItem icon={IconPayment} label="Payment" link="/payments"/>
                            <MenuItem icon={IconSupport} label="Get Help" link="/support"/>
                        </ul>
                        <hr className="my-4"/>
                        <SignoutButton className={"text-grayText hover:scale-105 transition duration-300"}/>
                    </>
                ) : (
                    <ul className="grid gap-6">
                        <MenuItem icon={IconSupport} label="Get Help" link="/support"/>
                    </ul>
                )}

            </main>

            {/* Footer */}
            <footer className={'desktop:mb-24 '}>
                <hr className="my-1"/>
                {login ? (
                    <LoggedInMenu name={name}/>
                ) : (
                    <GuestMenu/>
                )}
                <hr className="my-1"/>
                {/* You can add additional footer links or information here */}
                <ThemeSwitcher/>
            </footer>

        </div>
    );
}

interface LoggedInMenuProps {
    name?: string | null;
}

const LoggedInMenu: React.FC<LoggedInMenuProps> = ({ name}) => (
    <>
        <a
            className="flex flex-row items-center space-x-3 trigger-hover cursor-pointer hover:bg-grayBg p-2 rounded"
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
                <p className="text-grayText scale-on-hover-105">email@gmail.com</p>
            </div>
        </a>
    </>
);



const GuestMenu = () => (
    <>
        <div className="flex flex-row items-center space-x-3 px-2">
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
                <a className="text-grayText scale-on-hover-105"
                   href={"/signin"}
                >
                    Sign In
                </a>
            </div>
        </div>
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
        <a className="flex flex-row items-center space-x-3 hover:scale-105 transition duration-300" href={link}>
            <Icon className="w-8 h-8 text-text"/>
            <div className={"flex flex-col"}>
                <span className="text-lg">
                    {label}
                </span>
                <span className={`text-base text-primary ${pacifico.className}`}>
                    {subtitle}
            </span>
            </div>
        </a>
    </li>
);
