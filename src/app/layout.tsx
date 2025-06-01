import { lexendDeca } from "@/components/fonts";
import '@/styles/globals.css'
import React from "react";
import {getLocalizedMetadata} from "@/components/metadata";
import {Providers} from "@/app/providers";
import CookieConsentComponent from "@/components/ui/cookie-consent";
import type { Viewport } from 'next'
import {getCurrentSession} from "@/lib/actions/session";
import {NextIntlClientProvider} from 'next-intl';
import {getLocale, getMessages} from 'next-intl/server';
import LanguageModal from "@/components/language-modal";
import {getCookiePreferences, isCookieConsentFromServer} from "@/lib/actions/cookies/cookie";
import ClarityScript from "@/components/clarity-script";
import GoogleAnalytics from "@/components/google-analytics";
import { getLanguageCookie } from "@/lib/actions/language";


export const viewport: Viewport = {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 1,
    userScalable: true,
    viewportFit: 'cover'
}


export async function generateMetadata() {
    return getLocalizedMetadata('en');
}


export default async function RootLayout({
                                       children,
                                   }: Readonly<{
    children: React.ReactNode;
}>) {

    const session = await getCurrentSession();

    const lang = await getLanguageCookie();
    const locale = await getLocale();
    const currentLocale = 'en';

    const messages = await getMessages({locale: currentLocale});

    const cookieConsent = await isCookieConsentFromServer();
    const preferences = await getCookiePreferences();

    // Prepare WebSite structured data for JSON-LD
    const webSiteStructuredData = {
        "@context": "https://schema.org",
        "@type": "WebSite",
        "url": "https://www.thebakerz.com/",
        "name": "TheBakerz",
        "potentialAction": {
            "@type": "SearchAction",
            "target": "https://www.thebakerz.com/search?q={search_term_string}",
            "query-input": "required name=search_term_string"
        },
        "publisher": {
            "@type": "Organization",
            "name": "TheBakerz",
            "logo": {
                "@type": "ImageObject",
                "url": "https://storage4thebakerz.blob.core.windows.net/email-messages/TheBakerzLogo.svg"
            }
        }
    };

    return (
        <html lang={lang || locale}>
            <head>
            <script 
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{ __html: JSON.stringify(webSiteStructuredData) }} />
            </head>
            <body className={`${lexendDeca.className} max-w-full `}>
                <NextIntlClientProvider messages={messages} locale={lang || locale}>
                    <Providers
                        locale={lang || locale}
                        session={session}
                    >
                        <>
                            <ClarityScript />
                            <GoogleAnalytics/>
                        </>
                        {children}
                        {<CookieConsentComponent id={session?.user?.id} isConsent={cookieConsent} preferences={preferences} role={session?.user?.role}/>}
                    </Providers>
                </NextIntlClientProvider>
            </body>
        </html>
    );
}