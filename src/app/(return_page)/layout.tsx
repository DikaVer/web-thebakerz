/**
 * @fileoverview Layout for the (return_page) route group (favorites, orders, payments, policies).
 *
 * Server component that renders children inside LayoutComp with the sidebar
 * hidden and appends the simplified footer.
 */
import '@/styles/globals.css'
import React from "react";
import LayoutComp from "@/components/layout-comp";
import {FooterSimple} from "@/components/footer-simple";


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