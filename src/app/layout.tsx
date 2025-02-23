import { lexendDeca } from "@/components/fonts";
import '@/styles/globals.css'
import React from "react";
import type { Metadata } from "next";
import {Toaster} from "@/components/ui/sonner";
import {metadataDefault} from "@/components/metadata";
import {Providers} from "@/app/providers";
import CookieConsentComponent from "@/components/ui/cookie-consent";
import type { Viewport } from 'next'
import {getCurrentSession} from "@/lib/actions/session";
// import "azure-maps-control/dist/atlas.min.css";


export const viewport: Viewport = {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 10,
    userScalable: true,
}


export const metadata: Metadata = metadataDefault;


export default async function RootLayout({
                                       children,
                                   }: Readonly<{
    children: React.ReactNode;
}>) {

    const session = await getCurrentSession();

    // console.log(session);

    return (
        <html lang="en">

        <body className={`${lexendDeca.className} max-w-full `}>

            <Providers
                session={session}
            >
                {children}
                <CookieConsentComponent/>
                <Toaster/>
            </Providers>
            </body>
        </html>
    );
}