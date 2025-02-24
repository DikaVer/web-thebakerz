import '@/styles/globals.css'
import React, {Suspense} from "react";
import {Footer} from "@/components/footer";
import {StoreProvider} from "@/components/providers/store-provider";
import {ProductDialogProvider} from "@/components/providers/product-provider";
import LayoutComp from "@/components/layout-comp";

import {getStoreDataByStoreNameOrId} from "@/lib/actions/store";
import NotFound from "@/app/(error_layout)/not-found";
import StoreSkeleton from "@/components/skeletons";
import {getCart} from "@/lib/actions/cart";
import {getOrderTime} from "@/app/(store)/[id]/actions";
import {getProductsByStoreId, ProductDataFull} from "@/lib/actions/product";

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

    const cartData = await getCart(storeData.id);

    const productsData: ProductDataFull = await getProductsByStoreId(storeData.id);

    return (
        <ProductDialogProvider
            productsDataServer={productsData}
            cart={cartData}
            storeId={storeData.id}
        >
            <StoreProvider
                store={storeData}
            >
                <LayoutComp
                    hideSideBar={true}
                    store={storeData}
                >
                    <div className={'min-h-svh'}>
                        <Suspense fallback={<StoreSkeleton/>}>
                            {children}
                        </Suspense>
                    </div>
                </LayoutComp>
            </StoreProvider>
        </ProductDialogProvider>
    );
}