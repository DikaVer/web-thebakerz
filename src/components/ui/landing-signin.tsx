"use client";

import {Button} from '@heroui/react'
import * as React from "react";
import {usePathname, useRouter} from "next/navigation";
import {pacifico} from "@/components/fonts";
import {useEffect, useState} from "react";
import {useTranslations} from "next-intl";
import { useSession } from '@/components/providers/session-provider';
interface LandingSigninButtonProps {
    className: string;
}

export const LandingSigninButton = ({ className}: LandingSigninButtonProps) => {
    // Router and pathname for navigation
    const router = useRouter();
    const pathname = usePathname();
    const [isLoading, setLoading] = useState(false);
    const t = useTranslations("app/(components)/signin-button");
    const { session } = useSession();

    // Redirects the user to the sign-in page, appending the current path for post-authActions redirection
    const handleSignIn = () => {
        setLoading(true);
        router.push(`/auth?next=${pathname}`);
        router.refresh();
    };

    const handleStoreRedirect = () => {
        setLoading(true);
        if (session.stores && session.stores.length > 0) {
            router.push(`/${session.stores[0].name || session.stores[0].id}`);
            router.refresh();
        }
    };

    return session?.user ? (
        session.stores && session.stores.length > 0 ? (
            <Button
                isLoading={isLoading}
                disabled={isLoading}
                variant={'bordered'}
                className={`${className}`}
                onPress={handleStoreRedirect}
            >
                {isLoading ? t("loading") : t("storeRedirect")}
            </Button>
        ) : (
            <></>
        )
    ) : (
        <Button
            isLoading={isLoading}
            disabled={isLoading}
            variant={'bordered'}
            className={`${className}`}
            onPress={handleSignIn}
        >
            {isLoading ? t("loading") : t("signIn")}
        </Button>
    );
}