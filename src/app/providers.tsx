'use client'

import {HeroUIProvider} from "@heroui/react";
import dynamic from 'next/dynamic'
import {CookieConsentProvider} from "@/components/CookieConsentContext";
import {useRouter} from "next/navigation";
import {SessionProvider} from "@/components/providers/session-provider";
import {Session, SessionValidationResult} from "@/lib/actions/session";
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


export function Providers({session, children}: {
    session: SessionValidationResult,
    children: React.ReactNode
}) {
    const router = useRouter();

    return (
            <HeroUIProvider
                navigate={router.push}
            >
                <NextThemesProvider attribute="class" defaultTheme="light">
                    <SessionProvider sessionData={session}>
                        <CookieConsentProvider>
                                {children}
                        </CookieConsentProvider>
                    </SessionProvider>
                </NextThemesProvider>
            </HeroUIProvider>
    )
}