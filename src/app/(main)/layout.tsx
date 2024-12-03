import '@/styles/globals.css'
import React from "react";
import {Header} from "@/components/header";
import {Footer} from "@/components/footer";
import {extractSessionRole} from "@/lib/actions/session-actions";
import type {Metadata} from "next";
import {metadataDefault} from "@/components/metadata";
import {HeaderAligner} from "@/components/header-aligner";
import {MenuItems} from "@/components/menu/menu-items";

export const metadata: Metadata = metadataDefault;

export default async function RootLayout({
                                       children,
                                   }: Readonly<{
    children: React.ReactNode;
}>) {

    const {login, role, name} = await extractSessionRole();

    const menuItems = await MenuItems({login, role, name});

    return (
            <>
                <Header main={true} login={login} role={role} name={name} menuItems={menuItems}/>
                <HeaderAligner
                    menuItems={menuItems}
                >
                    {children}
                    <Footer/>
                </HeaderAligner>
            </>
    );
}