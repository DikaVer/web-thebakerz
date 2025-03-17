import '@/styles/globals.css'
import React from "react";
import {Footer} from "@/components/footer";
import type {Metadata} from "next";
import {metadataDefault} from "@/components/metadata";
import LayoutComp from "@/components/layout-comp";
import {FooterSimple} from "@/components/footer-simple";

export const metadata: Metadata = metadataDefault;

export default async function Layout(
    {
        children,
    } : {
        children: React.ReactNode
    }) {


    return (
        <>
            <LayoutComp
                hideSideBar={true}
            >
                <div className={'min-h-svh'}>
                    {children}
                </div>
                <FooterSimple/>
            </LayoutComp>
        </>
    );
}