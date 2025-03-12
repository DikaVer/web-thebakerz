import '@/styles/globals.css'
import React from "react";
import {Footer} from "@/components/footer";
import {StoreProvider} from "@/components/providers/store-provider";
import {ProductDialogProvider} from "@/components/providers/product-provider";
import LayoutComp from "@/components/layout-comp";

import {getCurrentStore, getStoreDataByStoreNameOrId} from "@/lib/actions/store";
import NotFound from "@/app/(error_layout)/not-found";
import Checkout from "@/components/checkout/payment/checkout";

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

    const {id} = await params

    const storeData = await getCurrentStore(id);

    if (!storeData) {
        return NotFound();
    }

    return <div>
                <StoreProvider
                    store={storeData}
                >
                    <LayoutComp
                        pay={true}
                        hideSideBar={true}
                        store={storeData}
                    >
                        {children}
                    </LayoutComp>
                </StoreProvider>
            </div>;
}