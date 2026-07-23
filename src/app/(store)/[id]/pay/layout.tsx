/**
 * @fileoverview Layout for the /[id]/pay payment segment.
 *
 * Minimal pass-through layout that renders children directly (providers are
 * set up in the parent store layout) and exports noindex "Checkout" metadata
 * via generateStorePageMetadata.
 */
import '@/styles/globals.css'
import React from "react";
import {generateStorePageMetadata} from "@/app/(store)/[id]/store-utils";

type Params = Promise<{ id: string  }>

export async function generateMetadata({ params }: {
    params: Params
}) {
    const { id } = await params;
    return generateStorePageMetadata(id, 'Checkout', 'Complete your purchase', { index: false, follow: false });
}

export default function Layout({
                                         children
                                     }: {
    children: React.ReactNode
}) {
    // We don't need to fetch store data or set up providers again as they're handled in the parent layout
    // We just need to render the children
    return children;
}