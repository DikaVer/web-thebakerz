import { lexendDeca } from "@/components/fonts";
import '@/styles/globals.css'
import React from "react";
import {getLocalizedMetadata} from "@/components/metadata";
import {Providers} from "@/app/providers";
import CookieConsentComponent from "@/components/ui/cookie-consent";
import type { Viewport } from 'next'
import {getCurrentSession} from "@/lib/actions/session";
import {getLanguageCookie} from "@/lib/actions/language";
import {NextIntlClientProvider} from 'next-intl';
import {getLocale, getMessages} from 'next-intl/server';
import LanguageModal from "@/components/language-modal";
import {getCookiePreferences, isCookieConsentFromServer} from "@/lib/actions/cookies/cookie";
import ClarityScript from "@/components/clarity-script";
import GoogleAnalytics from "@/components/google-analytics";


export const viewport: Viewport = {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 1,
    userScalable: true,
    viewportFit: 'cover'
}


export async function generateMetadata() {
    const locale = await getLocale();
    return getLocalizedMetadata(locale);
}


export default async function RootLayout({
                                       children,
                                   }: Readonly<{
    children: React.ReactNode;
}>) {

    const session = await getCurrentSession();

    const lang = await getLanguageCookie();
    const locale = await getLocale();

    const messages = await getMessages({locale: lang || locale});

    const cookieConsent = await isCookieConsentFromServer();
    const preferences = await getCookiePreferences();

    return (
        <html lang={lang || locale}>
            <body className={`${lexendDeca.className} max-w-full `}>
                <NextIntlClientProvider messages={messages}>
                    <Providers
                        locale={lang || locale}
                        session={session}
                    >
                        <>
                            <ClarityScript />
                            <GoogleAnalytics/>
                        </>
                        {children}
                        {!lang && <LanguageModal/>}
                        {<CookieConsentComponent id={session?.user?.id} isConsent={cookieConsent} preferences={preferences} role={session?.user?.role}/>}
                    </Providers>
                </NextIntlClientProvider>
            </body>
        </html>
    );
}