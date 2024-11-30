import '@/styles/globals.css'
import React from "react";
import {Header} from "@/components/header";
import {Footer} from "@/components/footer";
import {extractSessionRole} from "@/lib/actions/session-actions";
import type {Metadata} from "next";
import {metadataDefault} from "@/components/metadata";
import {Separator} from "@/components/ui/separator";
import {HeaderAligner} from "@/components/header-aligner";
import {AppSidebar} from "@/components/app-sidebar";

export const metadata: Metadata = metadataDefault;

export default async function RootLayout({
                                       children,
                                   }: Readonly<{
    children: React.ReactNode;
}>) {
    const {login, role, name} = await extractSessionRole();

    return (
            <>
                <Header main={true} login={login} role={role} name={name} />
                <HeaderAligner>
                    <AppSidebar main={true} login={login} role={role} name={name}/>
                    {children}
                    <Footer/>
                </HeaderAligner>

            </>
    );
}