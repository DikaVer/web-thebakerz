'use client';

import NavLinks from "@/components/dashboard/nav-links";
import {useRouter} from "next/navigation";
import React, {startTransition} from "react";
import {logout} from "@/lib/actions/auth-actions";

export default function SideNav() {
    const router = useRouter();
    const handleSignOut = async () => {
        startTransition(() => {
            logout();
            router.refresh();
        });
    };

    return (
        <div className="flex h-full flex-col px-3 py-4 md:px-2">
            <div
                className="mb-2 flex h-20 items-end justify-start rounded-md bg-primary p-4 md:h-40"
            >
                <div className="w-32 text-white md:w-40">
                    <p className={"text-3xl font-semibold text-secondary"}>TheBakerz</p>
                </div>
            </div>
            <div className="flex grow flex-row justify-between space-x-2 md:flex-col md:space-x-0 md:space-y-2">
                <NavLinks/>
                <div className="hidden h-auto w-full grow rounded-md bg-gray-50 md:block"></div>
                <form onClick={handleSignOut}>
                    <button
                        className="flex h-[48px] w-full grow items-center justify-center gap-2 rounded-md bg-gray-50 p-3 text-sm font-medium hover:bg-secondary hover:text-black md:flex-none md:justify-start md:p-2 md:px-3" type="submit">
                        <div className="hidden md:block">Sign Out</div>
                    </button>
                </form>
            </div>
        </div>
    );
}
