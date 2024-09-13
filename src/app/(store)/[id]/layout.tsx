import { lexendDeca } from "@/components/fonts";
import '@/styles/globals.css'
import React from "react";
import type { Metadata } from "next";
import {Footer} from "@/components/footer";
import {Header} from "@/components/header";
import {extractSessionRole} from "@/lib/actions/sessionAction";
import { getCheckoutSettings} from "@/lib/actions/session-store";

export const metadata: Metadata = {
    metadataBase: new URL(`https://www.TheBakerz.com/`),
    title: {
        default: 'TheBakerz',
        template: `%s - TheBakerz`
    },
    description: '',

}

export default async function RootLayout({
                                       children,
                                   }: Readonly<{
    children: React.ReactNode;
}>) {
    const {login, role, name} = await extractSessionRole();



    return (
            <>
                <Header main={false} login={login} role={role} name={name}/>
                    {children}
                <Footer/>
            </>
    );
}