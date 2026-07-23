/**
 * @fileoverview Sign-out transition page rendered at /transit-exit.
 *
 * Client component that shows a localized "signing out" loading screen while
 * it refreshes the router state and redirects to the URL given in the "next"
 * query parameter (or the home page by default).
 */
"use client";

import { pacifico } from "@/components/fonts";
import React, { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {IconLoadingCircle} from "@/components/ui/icons";
import { useTranslations } from 'next-intl';

export default function Page() {
    const nextParams = useSearchParams();
    const next = nextParams.get('next') as string;
    const t = useTranslations('app/(return_page)/transit-exit/page');
    const router = useRouter();

    useEffect(() => {
        router.refresh();
        router.push(next ? next : "/");
    }, [next, router]); // Added 'next' and 'router' as dependencies

    return (
        <div className="z-10 flex-grow container mx-auto text-center min-h-screen">
            <div className="flex flex-col justify-center items-center mb-12">
                <div className="flex flex-col min-h-screen justify-center items-center">
                    <IconLoadingCircle strokeWidth={3} className="text-grayText w-20 h-20" />
                    <p className={`text-4xl md:text-8xl my-10 ${pacifico.className}`}>
                        {t('performingSignOut')}
                    </p>
                </div>
            </div>
        </div>
    );
}