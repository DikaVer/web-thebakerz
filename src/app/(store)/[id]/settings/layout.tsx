import '@/styles/globals.css'
import React from "react";
import {StoreProvider} from "@/components/providers/store-provider";
import {ProductDialogProvider} from "@/components/providers/product-provider";
import LayoutComp from "@/components/layout-comp";

import {getCurrentStore} from "@/lib/actions/store";
import NotFound from "@/app/(error_layout)/not-found";
import { CartProvider } from '@/components/providers/cart-provider';
import {getCurrentSession} from "@/lib/actions/session";
import {redirect} from "next/navigation";
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