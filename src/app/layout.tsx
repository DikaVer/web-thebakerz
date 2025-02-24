import { lexendDeca } from "@/components/fonts";
import '@/styles/globals.css'
import React from "react";
import type { Metadata } from "next";
import {metadataDefault} from "@/components/metadata";
import {Providers} from "@/app/providers";
import CookieConsentComponent from "@/components/ui/cookie-consent";
import type { Viewport } from 'next'
import {getCurrentSession} from "@/lib/actions/session";
import {cookies} from "next/headers";



export const viewport: Viewport = {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 1,
    userScalable: true,
}


export const metadata: Metadata = metadataDefault;


export default async function RootLayout({
                                       children,
                                   }: Readonly<{
    children: React.ReactNode;
}>) {

    const session = await getCurrentSession();

    const cookieStore = await cookies();
    const lang = cookieStore.get('NEXT_LOCALE')?.value || 'en'

    return (
        <html lang={lang}>

        <body className={`${lexendDeca.className} max-w-full `}>

            <Providers
                session={session}
            >
                {children}
                <CookieConsentComponent/>
            </Providers>
            </body>
        </html>
    );
}