'use client'

import {HeroUIProvider} from "@heroui/react";
import dynamic from 'next/dynamic'
import {CookieConsentProvider} from "@/components/CookieConsentContext";
import {useRouter} from "next/navigation";
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


export function Providers({children}: { children: React.ReactNode }) {
    const router = useRouter();

    return (
            <HeroUIProvider
                navigate={router.push}
            >
                <NextThemesProvider attribute="class" defaultTheme="light">
                <CookieConsentProvider>
                        {children}
                </CookieConsentProvider>
                </NextThemesProvider>
            </HeroUIProvider>
    )
}