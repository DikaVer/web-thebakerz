'use server';

import * as React from 'react';
import Image from "next/image";
import {MenuButton} from "@/components/menu/menu-button";
import {MenuItems} from "@/components/menu/menu-items";
import {SigninButton} from "@/components/ui/signin-button";
import {CartButton} from "@/components/cart/cart-button";
import {pacifico} from "@/components/fonts";

// Define the props that the Header component will accept
interface HeaderProps {
    storeId?: string;  // Store ID
    main: boolean;  // Determines if the current page is the main page
    login: boolean;  // Specifies if the user is logged in
    role: string | undefined;  // Role of the user (e.g., admin, user)
    name: string | undefined | null;  // Name of the user
}

export async function Header({storeId, main, login, role, name }: HeaderProps) {
    const menuItems = await MenuItems({login, role, name});

    return (
        <header className="sticky top-0 w-full z-30 bg-white">
            <nav className="text-black pt-4">
                <div className="container mx-auto flex justify-between items-center">
                     {/*Conditionally render the menu button*/}
                    {main && login ? (
                        <MenuButton menuItems={menuItems}/>
                    ) : !main ? (
                        <MenuButton menuItems={menuItems}/>
                    ) : null}

                    {/* TheBakerz logo (conditionally shown if main is true) */}
                    <div className="flex flex-row hover:scale-125 transition duration-500 cursor-pointer">
                        <a href="/" className={`text-3xl font-bold mx-auto ${pacifico.className}`}>TheBakerz</a>
                    </div>

                    {/* Conditionally render the cart or sign-in button*/}
                    {main && login ? (
                        <div  className={`flex flex-col ${pacifico.className}`}>
                            <p className={``}>Search Bakerz</p>
                            <p className={`text-primary text-sm`}>Coming soon!</p>
                        </div>
                    ) : main && !login ? (
                        <SigninButton className={`rounded-lg text-sm`} variant={"secondary"}/>
                    ) : (
                        <CartButton
                            storeId={storeId}
                        />
                    )}
                </div>
                <hr className="mt-2"/>
            </nav>
        </header>
    );
}
