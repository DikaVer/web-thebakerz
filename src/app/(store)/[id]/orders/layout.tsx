import '@/styles/globals.css'
import React from "react";
import {StoreProvider} from "@/components/providers/store-provider";
import {ProductDialogProvider} from "@/components/providers/product-provider";
import LayoutComp from "@/components/layout-comp";

import {getCurrentStore} from "@/lib/actions/store";
import NotFound from "@/app/(error_layout)/not-found";
import { CartProvider } from '@/components/providers/cart-provider';
import {getCurrentSession} from "@/lib/actions/session";
import {FooterStore} from "@/components/footer-store";
import {getCurrentCart} from "@/lib/actions/cart";
import {redirect} from "next/navigation";
import {metadataDefault} from "@/components/metadata";

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

    const storeData = await getCurrentStore(id);

    if (!storeData) {
        return NotFound();
    }

    const session  = await getCurrentSession();

    if (!session?.store || session.store.id !== storeData.id) {
        !session?.user && redirect('/auth');
        return NotFound();
    }

    const cartData = await getCurrentCart(storeData.id);

    return (
        <CartProvider
            cart={cartData}
            storeId={storeData.id}
        >
            <ProductDialogProvider
                storeId={storeData.id}
            >
                <StoreProvider
                    store={storeData}
                >
                    <LayoutComp
                        store={storeData}
                    >
                        {children}
                    </LayoutComp>
                </StoreProvider>
            </ProductDialogProvider>
        </CartProvider>
    );
}