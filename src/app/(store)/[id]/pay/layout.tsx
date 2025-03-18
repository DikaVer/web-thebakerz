import '@/styles/globals.css'
import React from "react";
import {StoreProvider} from "@/components/providers/store-provider";
import LayoutComp from "@/components/layout-comp";

import {getCurrentStore} from "@/lib/actions/store";
import NotFound from "@/app/(error_layout)/not-found";

type Params = Promise<{ id: string  }>

export async function generateMetadata({ params }: {
    params: Params
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
        title: `Checkout | ${storeData.ownerName}`,
        description: `Complete your purchase at ${storeData.ownerName}`,
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