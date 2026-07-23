/**
 * @fileoverview Client-side provider stack used by the root layout.
 *
 * Exports the Providers component that wraps the app in HeroUIProvider,
 * next-themes (forced light theme), SessionProvider, and ToastProvider. Also
 * detects the browser language against supported locales, applies a DOM
 * patch to avoid Google Translate errors, and wires HeroUI navigation to the
 * Next.js router.
 */
'use client'

import { useEffect, useState } from 'react'
import { applyDOMNodePatch } from '@/lib/utils/dom-patch'
import { LOCALES, type Locale } from '@/lib/i18n'

import {HeroUIProvider, ToastProvider} from "@heroui/react";
import dynamic from 'next/dynamic'
import {useRouter} from "next/navigation";
import {SessionProvider} from "@/components/providers/session-provider";
import {SessionValidationResult} from "@/lib/actions/session";
const NextThemesProvider = dynamic(
    () => import('next-themes').then((e) => e.ThemeProvider),
    {
        ssr: false,
    }
)


declare module "@react-types/shared" {
    interface RouterConfig {
        routerOptions: NonNullable<Parameters<ReturnType<typeof useRouter>["push"]>[1]>;
    }
}

// Helper function to detect device language and validate against supported locales
function getDeviceLanguage(): Locale {
    if (typeof window === 'undefined') {
        return 'en'; // Default fallback for server-side rendering
    }

    // Get the browser language
    const browserLanguage = navigator.language || navigator.languages?.[0];
    
    if (!browserLanguage) {
        return 'en';
    }

    // Extract language code (e.g., 'en-US' -> 'en')
    const languageCode = browserLanguage.toLowerCase().substring(0, 2);
    
    // Check if the exact browser language is supported (e.g., 'en-NL')  
    if (LOCALES.includes(browserLanguage.toLowerCase() as Locale)) {
        return browserLanguage.toLowerCase() as Locale;
    }
    
    // Check if the language code is supported
    if (LOCALES.includes(languageCode as Locale)) {
        return languageCode as Locale;
    }
    
    // Special case for English variants
    if (languageCode === 'en') {
        return 'en';
    }
    
    // Fallback to English if language is not supported
    return 'en';
}

export function Providers({session, children, locale}: {
    session: SessionValidationResult,
    locale: string,
    children: React.ReactNode
}) {
    const router = useRouter();
    const [detectedLocale, setDetectedLocale] = useState<string>(locale);
    
    // Apply DOM patch to prevent Google Translate errors
    useEffect(() => {
        applyDOMNodePatch();
    }, []);

    // Detect device language on client side
    useEffect(() => {
        const deviceLanguage = getDeviceLanguage();
        // Only update if the passed locale is different from detected device language
        // and if no specific locale was intentionally set
        if (!locale || locale === 'en') {
            setDetectedLocale(deviceLanguage);
        }
    }, [locale]);

    // const isBecomePartner = pathname.includes('become-partner');
    // if (isBecomePartner) {
    //     setTheme('dark');
    // }


    return (
        <HeroUIProvider
            locale={detectedLocale}
            navigate={router.push}

        >
            <NextThemesProvider attribute="class" defaultTheme="light" forcedTheme="light" enableSystem={false}>
                    <SessionProvider sessionData={session}>
                        <div className={'relative z-60'}>
                            <ToastProvider
                                toastProps={{
                                    classNames: {
                                        base: 'z-60',
                                    }
                                }}
                            />
                        </div>
                        {children}
                    </SessionProvider>
            </NextThemesProvider>
        </HeroUIProvider>
    )
}
