"use client";

import {Button} from '@nextui-org/button'
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
    const [isLoading, setLoading] = useState(false);



    // Redirects the user to the sign-in page, appending the current path for post-authActions redirection
    const handleSignIn = () => {
        setLoading(true);
        router.push(`/auth?next=${pathname}`);
        router.refresh();
    };

    return (
        <Button
            isLoading={isLoading}
            disabled={isLoading}
            className={`${className} ${pacifico.className} shadow-lg`}
            color={variant === "default" ? "primary" : "secondary"}
            onPress={handleSignIn}
        >
            {isLoading ? "Loading" : "Sign in"}
        </Button>
    );
}