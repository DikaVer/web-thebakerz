import { lexendDeca } from "@/components/fonts";
import '@/app/globals.css'
import React from "react";
import type { Metadata } from "next";
import {Footer} from "@/components/footer";

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
        {children}
        <Footer/>
      </body>
    </html>
  );
}
