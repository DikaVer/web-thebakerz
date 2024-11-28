"use client";

import {Button} from "@/components/ui/button";
import * as React from "react";
import {usePathname, useRouter} from "next/navigation";
import {pacifico} from "@/components/fonts";
import {useEffect, useState} from "react";

interface SigninButtonProps {
    className: string;
    variant: "default" | "secondary";
}

export const SigninButton = ({ className, variant }: SigninButtonProps) => {
    // Router and pathname for navigation
    const router = useRouter();
    const pathname = usePathname();

    useEffect(() => {
        router.prefetch(`/auth?next=${pathname}`);
    }, []);

    // Redirects the user to the sign-in page, appending the current path for post-authActions redirection
    const handleSignIn = () => {
        router.push(`/auth?next=${pathname}`);
        router.refresh();
    };

    return (
        <Button
            className={`${className} ${pacifico.className}`}
            variant={variant}
            onClick={handleSignIn}
        >
            Sign in
        </Button>
    );
}