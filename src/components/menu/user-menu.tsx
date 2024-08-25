import React, { useState, useEffect } from 'react';
import {
    IconBill,
    IconPayment,
    IconSupport,
    IconAvatar
} from "@/components/ui/icons";
import { Button } from "@/components/ui/button";

interface MenuComponentProps {
    onClose: () => void;
    isOpen: boolean;
}

const MenuComponent: React.FC<MenuComponentProps> = ({ onClose, isOpen }) => {
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
            <div className="absolute bg-black opacity-50 inset-0" onClick={onClose}></div>
            <div className={`relative w-64 h-full bg-white shadow-lg transform transition-transform duration-700 ease-in-out ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
                <MenuItems />
            </div>
        </div>
    );
};

const MenuItems = () => (
    <>
        {false ? (
            <>
                <div className={"flex flex-row items-center space-x-3 p-2 pb-6 pt-6 trigger-hover cursor-pointer"}>
                    <IconAvatar className={"w-14-5 h-14-5"}/>
                    <div>
                        <p className={"text-lg"}>John Doe</p>
                        <p className={"text-primary scale-on-hover-105"}>Account settings</p>
                    </div>
                </div>
                <ul className={"grid pl-6 gap-6"}>
                    <MenuItem icon={IconBill} label="Orders" link="/orders"/>
                    <MenuItem icon={IconPayment} label="Payment Details" link="/payments"/>
                    <MenuItem icon={IconSupport} label="Get Help" link="/support"/>
                    <p className={"text-grayText hover:scale-105 transition duration-300"}>Sign out</p>
                </ul>
            </>
                ) : (
            <>
                <div className={"flex flex-row items-center space-x-3 p-2 pb-6 pt-6"}>
                    <IconAvatar className={`w-14-5 h-14-5`}/>
                    <div className={"grid gap-1"}>
                        <p className={"text-lg"}>Guest</p>
                        <div className={"flex flex-row space-x-3 -mx-2"}>
                            <Button className={"bg-grayComp transition hover:bg-grayCompHover rounded-2xl h-8 px-3 py-0 text-black"}>
                                Sign in
                            </Button>
                            <Button className={"rounded-2xl h-8 px-3 py-0"}>
                                Sign up
                            </Button>
                        </div>
                    </div>
                </div>
                <ul className={"grid pl-6 gap-6"}>
                    <MenuItem icon={IconSupport} label="Get Help" link="/support"/>
                </ul>
            </>
                )}
        <hr className={"m-4"}></hr>
        <ul className={"grid pl-6 gap-6"}>
            <li>
                <p className={'text-sm hover:scale-105 transition duration-300'}>Create a bakery account</p>
            </li>
        </ul>
    </>
);


const MenuItem = ({icon: Icon, label, link}: { icon: React.ElementType, label: string, link: string }) => (
    <li>
        <div className={"flex flex-row items-center space-x-3 hover:scale-105 transition duration-300"}>
            <Icon className={`w-7 h-7`}/>
            <a className={"text-lg"} href={link}>{label}</a>
        </div>
    </li>
);

export default MenuComponent;