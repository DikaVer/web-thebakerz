import '@/styles/globals.css'
import React from "react";
import {Footer} from "@/components/footer";
import {extractSession} from "@/lib/actions/session-actions";
import type {Metadata} from "next";
import {metadataDefault} from "@/components/metadata";
import LayoutComp from "@/components/layout-comp";

export const metadata: Metadata = metadataDefault;

export default async function Layout(
    {
                                         children,
                                  } : {
    children: React.ReactNode
}) {

    const session = await extractSession();

    return (
            <>
                <LayoutComp
                    session={session}
                >
                    <div className={'min-h-svh'}>
                        {children}
                    </div>
                    <Footer/>
                </LayoutComp>
            </>
    );
}