import '@/styles/globals.css'
import React from "react";
import {Footer} from "@/components/footer";
import {StoreProvider} from "@/components/providers/store-provider";
import {ProductDialogProvider} from "@/components/providers/product-provider";
import LayoutComp from "@/components/layout-comp";

import NotFound from "@/app/(store)/[id]/not-found";
import {getStoreDataByStoreNameOrId} from "@/lib/actions/store";

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

    const storeData = await getStoreDataByStoreNameOrId(id);

    if (!storeData) {
        return NotFound();
    }


    return (
        <>
            <ProductDialogProvider>
                <StoreProvider
                    store={storeData}
                >
                            <LayoutComp
                                store={storeData}
                            >
                                {children}
                                <Footer/>
                            </LayoutComp>
                </StoreProvider>
            </ProductDialogProvider>
        </>
    );
}