import '@/styles/globals.css'
import React from "react";
import type { Metadata } from "next";
import SideNav from "@/components/dashboard/sidenav";
import {ScrollArea} from "@/components/ui/scroll-area";
import NotFound from "@/app/(error_layout)/not-found";
import {getCurrentSession} from "@/lib/actions/session";

export const metadata: Metadata = {
    metadataBase: new URL(`https://www.TheBakerz.com/`),
    title: {
        default: 'TheBakerz',
        template: `%s - Dashboard`
    },
}

export default async function RootLayout({
                                             children,
                                         }: Readonly<{
    children: React.ReactNode;
}>) {

    const {session, user} = await getCurrentSession();

    if (!session) {
        return NotFound();

        // @ts-ignore
    } else if (user?.role !== 'admin') {
        return NotFound();
    }

    return (
        <>
            {children}
        </>
    );
}