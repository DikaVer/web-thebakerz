'use client';

import * as React from 'react';
import { useState } from 'react';
import {usePathname, useRouter} from 'next/navigation';
import { IconCart, IconMenu } from "@/components/ui/icons";
import MenuComponent from "@/components/menu/user-menu";
import CartComponent from "@/components/cart/cart";
import { Button } from "@/components/ui/button";
import Image from "next/image";

interface HeaderProps {
    main: boolean;
}

export function Header({ main }: HeaderProps) {
    const [isMenuOpen, setMenuOpen] = useState(false);
    const [isCartOpen, setCartOpen] = useState(false);

    const toggleMenu = () => {
        setMenuOpen(!isMenuOpen);
    };

    const toggleCart = () => {
        setCartOpen(!isCartOpen);
    };

    // Inside your component
    const router = useRouter();
    const pathname = usePathname()

    const handleSignIn = () => {
        router.push(`/auth?next=${pathname}`)
        router.refresh()
    };

    return (
        <header className="sticky top-0 w-full z-30 bg-white">
            <nav className="text-black pt-4">
                <div className="container mx-auto flex justify-between items-center">
                    {main ? (
                        // <Button className="rounded-lg text-sm" variant={"secondary"}>
                        //     Sign in
                        // </Button>
                        <>
                        </>
                    ) : (
                        <Button className="flex p-2 items-center bg-white rounded-full transition duration-500 hover:bg-gray-200" onClick={toggleMenu}>
                            <IconMenu className={"w-7 h-6"}/>
                        </Button>
                    )}
                    <div className="flex flex-row hover:scale-125 transition duration-500 cursor-pointer">
                        {main ? (
                        <Image
                            src={"https://assets.api.uizard.io/api/cdn/stream/18033399-a975-43b8-92c2-d47d79027e70.png"}
                            alt={"TheBakerz Logo"}
                            width={46}
                            height={42}
                            quality={100}
                        />
                        ):(
                            <></>
                        )}
                        <a href={"/"} className="text-2xl font-bold mx-auto">TheBakerz</a>
                    </div>
                    {main ? (
                        <Button className="rounded-lg text-sm" variant={"secondary"} onClick={handleSignIn}>
                            Sign in
                        </Button>
                    ) : (
                        <Button className="flex p-2 items-center bg-white rounded-full transition duration-500 hover:bg-gray-200" onClick={toggleCart}>
                            <IconCart className={"w-7 h-6"}/>
                        </Button>
                    )}
                </div>
                <hr className="mt-2" />
            </nav>
            <MenuComponent isOpen={isMenuOpen} onClose={() => setMenuOpen(false)} />
            <CartComponent isOpen={isCartOpen} onClose={() => setCartOpen(false)} />
        </header>
    );
}