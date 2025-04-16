import '@/styles/globals.css'
import React from "react";

import {getCurrentStore} from "@/lib/actions/store";
import NotFound from "@/app/(error_layout)/not-found";
import {verifyStoreAccess} from "@/app/(store)/[id]/store-utils";

type Params = Promise<{ id: string  }>

export async function generateMetadata({ params }: {
    params: Promise<{ id: string }>
}) {
    const { id } = await params;

    const storeData = await getCurrentStore(id);

    if (!storeData) {
        return {
            title: "Store Not Found",
            description: "The requested store could not be found."
        };
    }

    return {
        title: `Orders Management | ${storeData.ownerName}`,
        description: `Manage orders for ${storeData.ownerName}`,
        robots: {
            index: false,
            follow: false
        }
    };
}

export default async function Layout({
                                         children,
                                         params,
                                     }: {
    children: React.ReactNode
    params: Params
}) {

    const { id } = await params

    const storeData = await verifyStoreAccess(id);
    if (!storeData) {
        return NotFound();
    }

    return children;
}