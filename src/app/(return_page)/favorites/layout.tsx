/**
 * @fileoverview Layout for the /favorites route.
 *
 * Minimal server component that wraps the favorites page in a full-height
 * container.
 */
import '@/styles/globals.css'
import React from "react";

export default async function Layout(
    {
        children,
    } : {
        children: React.ReactNode
    }) {

    return (
        <>
            <div className="min-h-svh">
                {children}
            </div>
        </>
    );
} 