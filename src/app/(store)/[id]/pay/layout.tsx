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