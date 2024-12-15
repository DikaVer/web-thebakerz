import '@/styles/globals.css'
import React from "react";
import {Header} from "@/components/header";
import {Footer} from "@/components/footer";
import {extractSession} from "@/lib/actions/session-actions";
import type {Metadata} from "next";
import {metadataDefault} from "@/components/metadata";
import {HeaderAligner} from "@/components/header-aligner";
import {MenuItems} from "@/components/menu/menu-items";

export const metadata: Metadata = metadataDefault;

export default async function Layout({
                                         children,
                                  }: {
    children: React.ReactNode
}) {

    const session = await extractSession();

    return (
            <>
                <Header main={true}
                        session={session}
                />
                <HeaderAligner
                    session={session}
                >
                    {children}
                    <Footer/>
                </HeaderAligner>
            </>
    );
}