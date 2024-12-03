import { lexendDeca } from "@/components/fonts";
import '@/styles/globals.css'
import React from "react";
import type { Metadata } from "next";
import {Toaster} from "@/components/ui/sonner";
import {metadataDefault} from "@/components/metadata";
import {Providers} from "@/app/providers";
import { SpeedInsights } from '@vercel/speed-insights/next';


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
                <Providers>
                            {children}
                            <Toaster/>
                </Providers>
                <SpeedInsights />
            </body>
            </html>
    );
}