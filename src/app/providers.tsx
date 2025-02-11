'use client'

import {HeroUIProvider} from "@heroui/react";
import dynamic from 'next/dynamic'
import {CookieConsentProvider} from "@/components/CookieConsentContext";
import {useRouter} from "next/navigation";
import {SessionProvider} from "@/components/providers/session-provider";
import {SessionValidationResult} from "@/lib/actions/session";
const NextThemesProvider = dynamic(
    () => import('next-themes').then((e) => e.ThemeProvider),
    {
        ssr: false,
    }
)

import {GregorianCalendar} from '@internationalized/date';

function createCalendar(identifier: any) {
    switch (identifier) {
        case 'gregory':
            return new GregorianCalendar();
        default:
            throw new Error(`Unsupported calendar ${identifier}`);
    }
}

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
                createCalendar={createCalendar}
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