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
            className={`${className} ${pacifico.className}`}
            color={variant === "default" ? "primary" : "secondary"}
            onClick={handleSignIn}
            spinner={
                <svg
                    className="animate-spin h-5 w-5 text-current"
                    fill="none"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                >
                    <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                    />
                    <path
                        className="opacity-75"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        fill="currentColor"
                    />
                </svg>
            }
        >
            {isLoading ? "Loading" : "Sign in"}
        </Button>
    );
}