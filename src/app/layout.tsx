import { lexendDeca } from "@/components/fonts";
import '@/styles/globals.css'
import React from "react";
import type { Metadata } from "next";
import {Toaster} from "@/components/ui/sonner";
import Head from 'next/head';
import {CartProvider} from "@/components/providers/cart-provider";

export const metadata: Metadata = {
    metadataBase: new URL(`https://www.TheBakerz.com/`),
    title: {
        default: 'TheBakerz',
        template: `%s - TheBakerz`
    },
    description: '',
    

}

// export const experimental_ppr = true;

export default function RootLayout({
                                       children,
                                   }: Readonly<{
    children: React.ReactNode;
}>) {

    return (
        <html lang="en">
            <Head>
                <link
                    rel="apple-touch-icon"
                    href="/apple-touch-icon.png"
                    type="image/png"
                    sizes="180x180"
                />
                <link
                    rel="icon"
                    href="/favicon.ico"
                    type="image/ico"
                    sizes="32x32"
                />
            </Head>
            <body className={lexendDeca.className}>
                <main>
                    {children}
                </main>
                <Toaster/>
            </body>
            </html>
    );
}