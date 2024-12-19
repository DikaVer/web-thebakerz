import { lexendDeca } from "@/components/fonts";
import '@/styles/globals.css'
import React from "react";
import type { Metadata } from "next";
import {Toaster} from "@/components/ui/sonner";
import {metadataDefault} from "@/components/metadata";
import {Providers} from "@/app/providers";
import CookieConsentComponent from "@/components/ui/cookie-consent";
import type { Viewport } from 'next'

export const viewport: Viewport = {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 10,
    userScalable: true,
}


export const metadata: Metadata = metadataDefault;


export default function RootLayout({
                                       children,
                                   }: Readonly<{
    children: React.ReactNode;
}>) {

    return (
        <html lang="en">

        <body className={`${lexendDeca.className} max-w-full `}>

            <Providers>

                {children}
                <CookieConsentComponent/>
                <Toaster/>
            </Providers>
            </body>
        </html>
    );
}