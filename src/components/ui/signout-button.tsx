"use client";

import * as React from "react";
import {useRouter} from "next/navigation";
import {startTransition} from "react";
import {logout} from "@/lib/actions/auth-actions";

interface SignoutButtonProps {
    className: string;
}

export const SignoutButton = ({ className}: SignoutButtonProps) => {

    const handleSignOut = async () => {
        startTransition(() => {
            localStorage.clear()
            logout();
            window.location.reload();
        });
    };

    return (
        <form onClick={handleSignOut}>
            <button className={`${className}`} type="submit">
                Sign Out
            </button>
        </form>
    );
}