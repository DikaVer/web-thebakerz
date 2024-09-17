import React, { useState, useEffect, startTransition } from 'react';
import {
    IconBill,
    IconPayment,
    IconSupport,
    IconAvatar
} from "@/components/ui/icons";
import { Button } from "@/components/ui/button";
import { logout } from "@/lib/actions/auth-actions";
import { usePathname, useRouter } from "next/navigation";

interface MenuComponentProps {
    onClose: () => void;
    isOpen: boolean;
    login: boolean;
    role?: string;
    name?: string | null;
}

const MenuComponent: React.FC<MenuComponentProps> = ({ onClose, isOpen, login, role, name }) => {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        if (isOpen) {
            setIsVisible(true);
        } else {
            const timer = setTimeout(() => setIsVisible(false), 500);
            return () => clearTimeout(timer);
        }
    }, [isOpen]);

    return (
        <div className={`fixed inset-0 z-50 transition-opacity duration-700 ${isOpen ? 'opacity-100' : 'opacity-0'} ${isVisible ? 'visible' : 'invisible'}`}>
            <div className="absolute bg-black opacity-50 inset-0" onClick={onClose} />
            <div className={`relative w-64 h-full bg-white shadow-lg transform transition-transform duration-700 ease-in-out ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
                <MenuItems login={login} role={role} name={name} />
            </div>
        </div>
    );
};

interface MenuItemsProps {
    login: boolean;
    role?: string;
    name?: string | null;
}

const MenuItems: React.FC<MenuItemsProps> = ({ login, role, name }) => {
    const router = useRouter();
    const pathname = usePathname();

    const handleSignOut = async () => {
        startTransition(() => {
            logout();
            router.refresh();
        });
    };

    const handleSignIn = () => {
        router.push(`/auth?next=${pathname}`);
        router.refresh();
    };

    return (
        <>
            {login ? (
                <LoggedInMenu name={name} handleSignOut={handleSignOut} />
            ) : (
                <GuestMenu handleSignIn={handleSignIn} />
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
    handleSignOut: () => void;
}

const LoggedInMenu: React.FC<LoggedInMenuProps> = ({ name, handleSignOut }) => (
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
            <form onClick={handleSignOut}>
                <button className="text-grayText hover:scale-105 transition duration-300" type="submit">
                    Sign Out
                </button>
            </form>
        </ul>
    </>
);

interface GuestMenuProps {
    handleSignIn: () => void;
}

const GuestMenu: React.FC<GuestMenuProps> = ({ handleSignIn }) => (
    <>
        <div className="flex flex-row items-center space-x-3 p-2 pb-6 pt-6">
            <IconAvatar className="w-18 h-18" />
            <div className="grid gap-1 -mt-1">
                <p className="text-lg">Guest</p>
                <div className="flex flex-row space-x-3 -mx-2">
                    <Button className="rounded-xl h-8 ml-1 px-5 py-0" variant="secondary" onClick={handleSignIn}>
                        Sign in
                    </Button>
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

export default MenuComponent;
