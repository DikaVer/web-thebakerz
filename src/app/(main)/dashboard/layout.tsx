/**
 * @fileoverview Layout guarding the /dashboard admin section.
 *
 * Server component that checks the current session and renders the NotFound
 * page unless the user is authenticated with the admin role. Wraps children
 * in a centered container and sets the dashboard title template metadata.
 */
import '@/styles/globals.css'
import React from "react";
import type { Metadata } from "next";

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
        <div className={'container mx-auto min-h-svh'}>
            {children}
        </div>
    );
}