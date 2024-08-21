import { lexendDeca } from "@/components/fonts";
import '@/styles/globals.css'
import React from "react";
import type { Metadata } from "next";
import {Footer} from "@/components/footer";
import {Header} from "@/components/header";

export const metadata: Metadata = {
    metadataBase: new URL(`https://www.TheBakerz.com/`),
    title: {
        default: 'TheBakerz',
        template: `%s - TheBakerz`
    },
    description: '',

}

export default function RootLayout({
                                       children,
                                   }: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en">
            <body className={lexendDeca.className}>
                <Header main={true}/>
                    {children}
                <Footer/>
            </body>
        </html>
    );
}
