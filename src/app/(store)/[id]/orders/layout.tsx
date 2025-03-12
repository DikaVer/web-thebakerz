import '@/styles/globals.css'
import React from "react";
import {Footer} from "@/components/footer";
import {StoreProvider} from "@/components/providers/store-provider";
import {ProductDialogProvider} from "@/components/providers/product-provider";
import LayoutComp from "@/components/layout-comp";

import {getCurrentStore, getStoreDataByStoreNameOrId} from "@/lib/actions/store";
import NotFound from "@/app/(error_layout)/not-found";
import { CartProvider } from '@/components/providers/cart-provider';
import {getCurrentSession} from "@/lib/actions/session";
import {FooterStore} from "@/components/footer-store";
import {getCurrentCart, removeCartByUserIdAndStoreId} from "@/lib/actions/cart";
import {getOrderTime} from "@/app/(store)/[id]/actions";
import {redirect} from "next/navigation";

type Params = Promise<{ id: string  }>

export async function generateMetadata({ params }: { // @ts-ignore
    params: Params }) {
    const { id } = await params
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
        !session?.user && redirect('/auth?next=' + window.location.pathname);
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
                        <FooterStore/>
                    </LayoutComp>
                </StoreProvider>
            </ProductDialogProvider>
        </CartProvider>
    );
}