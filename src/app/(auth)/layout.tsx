import '@/styles/globals.css'
import React from "react";
import type { Metadata } from "next";
import {Footer} from "@/components/footer";
import {auth} from "@/auth";
import {redirect} from "next/navigation";

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

    const session = await auth();

    if (session) {
        redirect("/");
    }

    return (
            <>
                {children}
                <Footer/>
            </>
    );
}