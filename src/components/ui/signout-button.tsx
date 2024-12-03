"use client";

import * as React from "react";
import {usePathname, useRouter} from "next/navigation";
import {startTransition, useEffect} from "react";
import {logout} from "@/lib/actions/auth-actions";

interface SignoutButtonProps {
    className: string;
}

export const SignoutButton = ({ className}: SignoutButtonProps) => {
    const router = useRouter();
    const pathname = usePathname();

    useEffect(() => {

        router.prefetch(`/auth/logout?next=${pathname}`);
    }, []);

    const handleSignOut = async () => {
        startTransition(() => {
            sessionStorage.clear();
            localStorage.clear();
            logout();
            router.push(`/auth/transit-exit?next=${pathname}`);
            router.refresh();
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