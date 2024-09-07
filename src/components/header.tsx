'use client';

import * as React from 'react';
import { useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { IconCart, IconMenu } from "@/components/ui/icons";
import MenuComponent from "@/components/menu/user-menu";
import CartComponent from "@/components/cart/cart-component";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { getAll } from "@/lib/actions/session-store";

// Define the props that the Header component will accept
interface HeaderProps {
    main: boolean;  // Determines if the current page is the main page
    login: boolean;  // Specifies if the user is logged in
    role: string | undefined;  // Role of the user (e.g., admin, user)
    name: string | undefined | null;  // Name of the user
}

export function Header({ main, login, role, name }: HeaderProps) {
    // State for controlling the menu and cart visibility
    const [isMenuOpen, setMenuOpen] = useState(false);
    const [isCartOpen, setCartOpen] = useState(false);
    const [cart, setCart] = useState<any>(null);

    // Toggles the visibility of the menu
    const toggleMenu = () => {
        setMenuOpen((prevState) => !prevState);
    };

    // Toggles the cart, and fetches cart data asynchronously
    const toggleCart = async () => {
        setCartOpen((prevState) => !prevState);
        if (!isCartOpen) {
            const cartData = await getAll();  // Fetch cart data from session-store
            setCart(cartData);
        }
    };

    // Router and pathname for navigation
    const router = useRouter();
    const pathname = usePathname();

    // Redirects the user to the sign-in page, appending the current path for post-login redirection
    const handleSignIn = () => {
        router.push(`/auth?next=${pathname}`);
        router.refresh();
    };

    return (
        <header className="sticky top-0 w-full z-30 bg-white">
            <nav className="text-black pt-4">
                <div className="container mx-auto flex justify-between items-center">
                    {/* Conditionally render the menu button */}
                    {main && login ? (
                        <Button className="flex p-2 items-center bg-white rounded-full transition duration-500 hover:bg-gray-200" onClick={toggleMenu}>
                            <IconMenu className="w-7 h-6" />
                        </Button>
                    ) : !main ? (
                        <Button className="flex p-2 items-center bg-white rounded-full transition duration-500 hover:bg-gray-200" onClick={toggleMenu}>
                            <IconMenu className="w-7 h-6" />
                        </Button>
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
                        <a href="/" className="text-2xl font-bold mx-auto">TheBakerz</a>
                    </div>

                    {/* Conditionally render the cart or sign-in button */}
                    {main && login ? (
                        <Button className="flex p-2 items-center bg-white rounded-full transition duration-500 hover:bg-gray-200" onClick={toggleCart}>
                            <IconCart className="w-7 h-6" />
                        </Button>
                    ) : main && !login ? (
                        <Button className="rounded-lg text-sm" variant="secondary" onClick={handleSignIn}>
                            Sign in
                        </Button>
                    ) : (
                        <Button className="flex p-2 items-center bg-white rounded-full transition duration-500 hover:bg-gray-200" onClick={toggleCart}>
                            <IconCart className="w-7 h-6" />
                        </Button>
                    )}
                </div>
                <hr className="mt-2" />
            </nav>

            {/* Conditionally render Menu and Cart Components */}
            {login ? (
                <>
                    <MenuComponent isOpen={isMenuOpen} login={login} role={role} name={name} onClose={() => setMenuOpen(false)} />
                    <CartComponent isOpen={isCartOpen} cart={cart} onClose={() => setCartOpen(false)} />
                </>
            ) : (
                <>
                    <MenuComponent isOpen={isMenuOpen} login={login} role={role} name={name} onClose={() => setMenuOpen(false)} />
                    <CartComponent isOpen={isCartOpen} cart={cart} onClose={() => setCartOpen(false)} />
                </>
            )}
        </header>
    );
}
