"use server";

import React from "react";
import {IconAvatar, IconBill, IconPayment, IconSupport} from "@/components/ui/icons";
import {SigninButton} from "@/components/ui/signin-button";
import {SignoutButton} from "@/components/ui/signout-button";


interface MenuItemsProps {
    login: boolean;  // Specifies if the user is logged in
    role: string | undefined;  // Role of the user (e.g., admin, user)
    name: string | undefined | null;  // Name of the user
}

export async function MenuItems({ login, name, role }: MenuItemsProps) {

    return (
        <>
            {login ? (
                <LoggedInMenu name={name}/>
            ) : (
                <GuestMenu />
            )}
            <hr className="m-4" />
            <ul className="grid pl-6 gap-6">
                <li>
                    <p className="text-sm hover:scale-105 transition duration-300">Create a bakery account</p>
                </li>
            </ul>
        </>
    );
};

interface LoggedInMenuProps {
    name?: string | null;
}

const LoggedInMenu: React.FC<LoggedInMenuProps> = ({ name}) => (
    <>
        <div className="flex flex-row items-center space-x-3 p-2 pb-6 pt-6 trigger-hover cursor-pointer">
            <IconAvatar className="w-14-5 h-14-5" />
            <div>
                <p className="text-lg">{name}</p>
                <p className="text-primary scale-on-hover-105">Account settings</p>
            </div>
        </div>
        <ul className="grid pl-6 gap-6">
            <MenuItem icon={IconBill} label="Orders" link="/orders" />
            <MenuItem icon={IconPayment} label="Payment Details" link="/payments" />
            <MenuItem icon={IconSupport} label="Get Help" link="/support" />
            <SignoutButton className={"text-grayText hover:scale-105 transition duration-300"}/>
        </ul>
    </>
);



const GuestMenu = () => (
    <>
        <div className="flex flex-row items-center space-x-3 p-2 pb-6 pt-6">
            <IconAvatar className="w-18 h-18" />
            <div className="grid gap-1 -mt-1">
                <p className="text-lg">Guest</p>
                <div className="flex flex-row space-x-3 -mx-2">
                    <SigninButton className={"rounded-xl h-8 ml-1 px-5 py-0"} variant={"secondary"}/>
                </div>
            </div>
        </div>
        <ul className="grid pl-6 gap-6">
            <MenuItem icon={IconSupport} label="Get Help" link="/support" />
        </ul>
    </>
);

interface MenuItemProps {
    icon: React.ElementType;
    label: string;
    link: string;
}

const MenuItem: React.FC<MenuItemProps> = ({ icon: Icon, label, link }) => (
    <li>
        <div className="flex flex-row items-center space-x-3 hover:scale-105 transition duration-300">
            <Icon className="w-7 h-7" />
            <a className="text-lg" href={link}>
                {label}
            </a>
        </div>
    </li>
);
