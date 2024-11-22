import { lexendDeca } from "@/components/fonts";
import '@/styles/globals.css'
import React from "react";
import type { Metadata } from "next";
import {Toaster} from "@/components/ui/sonner";
import {metadataDefault} from "@/components/metadata";
import { SpeedInsights } from "@vercel/speed-insights/next";


export const metadata: Metadata = metadataDefault;


// export const experimental_ppr = true;

export default function RootLayout({
                                       children,
                                   }: Readonly<{
    children: React.ReactNode;
}>) {

    return (
        <html lang="en">
            <body className={lexendDeca.className}>
                <main>
                    {children}
                </main>
                <SpeedInsights />
                <Toaster/>
            </body>
            </html>
    );
}