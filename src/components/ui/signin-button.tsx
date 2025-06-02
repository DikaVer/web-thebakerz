"use client";

import {Button} from '@heroui/react'
import * as React from "react";
import {usePathname, useRouter} from "next/navigation";
import {pacifico} from "@/components/fonts";
import {useEffect, useState} from "react";
import {useTranslations} from "next-intl";

interface SigninButtonProps {
    className: string;
}

export const SigninButton = ({ className}: SigninButtonProps) => {
    // Router and pathname for navigation
    const router = useRouter();
    const pathname = usePathname();
    const [isLoading, setLoading] = useState(false);
    const t = useTranslations("app/(components)/signin-button");

    // Redirects the user to the sign-in page, appending the current path for post-authActions redirection
    const handleSignIn = () => {
        setLoading(true);
        router.push(`/auth?next=${pathname}`);
        router.refresh();
    };

    return (
        <Button
            aria-label="Sign in"
            isLoading={isLoading}
            disabled={isLoading}
            className={`bg-background-secondary rounded-full`}
            onPress={handleSignIn}
        >
            {isLoading ? t("loading") : t("signIn")}
        </Button>
    );
}