'use client'

import { useEffect } from 'react'
import { applyDOMNodePatch } from '@/lib/utils/dom-patch'

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


export function Providers({session, children, locale}: {
    session: SessionValidationResult,
    locale: string,
    children: React.ReactNode
}) {
    const router = useRouter();
    // const pathname = usePathname();
    // const { theme, setTheme } = useTheme();

    // Apply DOM patch to prevent Google Translate errors
    useEffect(() => {
        applyDOMNodePatch();
    }, []);

    // const isBecomePartner = pathname.includes('become-partner');
    // if (isBecomePartner) {
    //     setTheme('dark');
    // }


    return (
        <HeroUIProvider
            locale={locale}
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
