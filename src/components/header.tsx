'use server';

import * as React from 'react';
import Image from "next/image";
import {MenuButton} from "@/components/menu/menu-button";
import {MenuItems} from "@/components/menu/menu-items";
import {SigninButton} from "@/components/ui/signin-button";

// Define the props that the Header component will accept
interface HeaderProps {
    main: boolean;  // Determines if the current page is the main page
    login: boolean;  // Specifies if the user is logged in
    role: string | undefined;  // Role of the user (e.g., admin, user)
    name: string | undefined | null;  // Name of the user
}

export async function Header({ main, login, role, name }: HeaderProps) {
    const menuItems = await MenuItems({login, role, name});


    return (
        <header className="sticky top-0 w-full z-30 bg-white">
            <nav className="text-black pt-4">
                <div className="container mx-auto flex justify-between items-center">
                    {/* Conditionally render the menu button */}
                    {main && login ? (
                        <MenuButton menuItems={menuItems}/>
                    ) : !main ? (
                        <MenuButton menuItems={menuItems}/>
                    ) : null}

                    {/* TheBakerz logo (conditionally shown if main is true) */}
                    <div className="flex flex-row hover:scale-125 transition duration-500 cursor-pointer">
                        {main && (
                            <Image
                                src="https://assets.api.uizard.io/api/cdn/stream/18033399-a975-43b8-92c2-d47d79027e70.png"
                                alt="TheBakerz Logo"
                                width={46}
                                height={42}
                                quality={100}
                            />
                        )}
                        <a href="/public" className="text-2xl font-bold mx-auto">TheBakerz</a>
                    </div>

                    {/* Conditionally render the cart or sign-in button*/}
                    {main && login ? (
                        // <Button className="flex p-2 items-center bg-white rounded-full transition duration-500 hover:bg-gray-200" onClick={toggleCart}>
                        //     <IconCart className="w-7 h-6" />
                        // </Button>
                        <div></div>
                    ) : main && !login ? (
                        <SigninButton className={"rounded-lg text-sm "} variant={"secondary"}/>
                    ) : (
                        <div>
                        </div>

                    )}
                </div>
                <hr className="mt-2"/>
            </nav>

            {/* Conditionally render Menu and Cart Components */}
            {/*{login ? (*/}
            {/*    <>*/}

            {/*        <CartComponent isOpen={isCartOpen} cart={cart} onClose={() => setCartOpen(false)} />*/}
            {/*    </>*/}
            {/*) : (*/}
            {/*    <>*/}
            {/*        <MenuComponent isOpen={isMenuOpen} login={login} role={role} name={name} onClose={() => setMenuOpen(false)} />*/}
            {/*        <CartComponent isOpen={isCartOpen} cart={cart} onClose={() => setCartOpen(false)} />*/}
            {/*    </>*/}
            {/*)}*/}
        </header>
    );
}
