import { lexendDeca } from "@/components/fonts";
import { connection } from "next/server";
import '@/styles/globals.css'
import React from "react";
import type { Metadata } from "next";
import {getLocalizedMetadata, metadataDefault} from "@/components/metadata";
import {Providers} from "@/app/providers";
import CookieConsentComponent from "@/components/ui/cookie-consent";
import type { Viewport } from 'next'
import {getCurrentSession} from "@/lib/actions/session";
import {getLanguageCookie} from "@/lib/actions/language";
import {NextIntlClientProvider} from 'next-intl';
import {getLocale, getMessages} from 'next-intl/server';
import LanguageModal from "@/components/language-modal";
import {getCookiePreferences, isCookieConsentFromServer} from "@/lib/cookie";
import ClarityScript from "@/components/clarity-script";


export const viewport: Viewport = {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 1,
    userScalable: true,
}


export async function generateMetadata() {
    const locale = await getLocale();
    return getLocalizedMetadata(locale);
}

export const revalidate = 300;


export default async function RootLayout({
                                       children,
                                   }: Readonly<{
    children: React.ReactNode;
}>) {
    // Opt-out of static generation for every page so the CSP nonce can be applied
    await connection();

    const session = await getCurrentSession();

    const lang = await getLanguageCookie();
    const locale = await getLocale();

    const messages = await getMessages({locale: lang || locale});

    const cookieConsent = await isCookieConsentFromServer();
    const preferences = await getCookiePreferences();

    return (
        <html lang={lang || locale} translate={'no'} >
            <body className={`${lexendDeca.className} max-w-full `}>
                <NextIntlClientProvider messages={messages}>
                    <Providers
                        locale={lang || locale}
                        session={session}
                    >
                        <ClarityScript
                            id={session.user?.id}
                            preferences={preferences}
                        />
                        {children}
                        {!lang && <LanguageModal/>}
                        {!cookieConsent && <CookieConsentComponent/>}
                    </Providers>
                </NextIntlClientProvider>
            </body>
        </html>
    );
}