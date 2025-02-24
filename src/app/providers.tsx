'use client'

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

import {CookieConsentProvider} from "@/components/providers/cookie-provider";

declare module "@react-types/shared" {
    interface RouterConfig {
        routerOptions: NonNullable<Parameters<ReturnType<typeof useRouter>["push"]>[1]>;
    }
}


export function Providers({session, children}: {
    session: SessionValidationResult,
    children: React.ReactNode
}) {
    const router = useRouter();

    return (
            <HeroUIProvider
                locale="nl-NL"
                navigate={router.push}
            >

                <NextThemesProvider attribute="class" defaultTheme="light">
                    <SessionProvider sessionData={session}>
                        <ToastProvider />
                        <CookieConsentProvider>
                                {children}
                        </CookieConsentProvider>
                    </SessionProvider>
                </NextThemesProvider>
            </HeroUIProvider>
    )
}
