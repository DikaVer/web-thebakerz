'use server';

import * as React from 'react';
import {MenuButton} from "@/components/menu/menu-button";
import {SigninButton} from "@/components/ui/signin-button";
import {CartButton} from "@/components/cart/cart-button";
import {pacifico} from "@/components/fonts";
import NotificationButton from "@/components/ui/notification-button";


// Define the props that the Header component will accept
interface HeaderProps {
    storeId?: string;  // Store ID
    main: boolean;  // Determines if the current page is the main page
    session: {
        login: boolean;  // Specifies if the user is logged in
        role: string | undefined;  // Role of the user (e.g., admin, user)
        name: string | undefined | null;  // Name of the user
        email: string | undefined | null;  // Email of the user
    }
}

export async function Header({storeId, main, session }: HeaderProps) {

    return (
        // <Navbar
        //     classNames={{
        //         base: ("border-grayText w-full"),
        //         wrapper: "w-full justify-center p-0 gap-0 items-end sticky",
        //         item: "hidden md:flex"
        //         ,
        //     }}
        //     height="64px"
        // >
        <header className="sticky header top-0 w-full z-30 pt-4 bg-background">
            <nav className={"w-full"}>
                <div className={`${session.login ? "" : "mx-2"} desktop:mx-10 flex justify-between items-center`}>
                    <MenuButton
                        session={session}
                    />
                    {/* TheBakerz logo (conditionally shown if main is true) */}
                    <div className="flex flex-row hover:scale-125 transition duration-500 cursor-pointer">
                        <a href="/"
                           className={`text-3xl animate-fadeInDown mx-auto ${pacifico.className}`}>TheBakerz</a>
                    </div>

                    {/* Conditionally render the cart or sign-in button*/}
                    {main && session.login ? (
                        <NotificationButton/>
                    ) : main && !session.login ? (
                        <SigninButton className={`text-large mr-4`} variant={"secondary"}/>
                    ) : (
                        <CartButton
                            storeId={storeId}
                        />
                    )}
                </div>
                <hr className="mt-2"/>
            </nav>
        </header>
            // </Navbar>

    );
}
