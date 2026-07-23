/**
 * @fileoverview Layout for the /[id]/products store management segment.
 *
 * Server component that verifies the current user has management access to
 * the store before rendering product management pages, showing NotFound
 * otherwise. Exports noindex "Products Management" metadata via
 * generateMetadata.
 */
import '@/styles/globals.css'
import React from "react";
import NotFound from "@/app/(error_layout)/not-found";

import {verifyStoreAccess} from "@/app/(store)/[id]/store-utils";

type Params = Promise<{ id: string  }>

export async function generateMetadata({ params }: {
    params: Params
}) {
    const { id } = await params;

    return {
        title: `Products Management | ${id}`,
        description: `Manage products for ${id}`,
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