import '@/styles/globals.css'
import React, {Suspense} from "react";
import {StoreProvider} from "@/components/providers/store-provider";
import {ProductDialogProvider} from "@/components/providers/product-provider";
import LayoutComp from "@/components/layout-comp";

import {getCurrentStore, getStoreDataByStoreNameOrId} from "@/lib/actions/store";
import NotFound from "@/app/(error_layout)/not-found";
import StoreSkeleton from "@/components/skeletons";
import {getCurrentCart} from "@/lib/actions/cart";
import {getCurrentProducts, ProductDataFull} from "@/lib/actions/product";
import {CartProvider} from "@/components/providers/cart-provider";

type Params = Promise<{ id: string  }>


export async function generateMetadata({ params }: {
    params: Promise<{ id: string }>
}) {
    const { id } = await params;

    const storeData = await getCurrentStore(id);

    if (!storeData) {
        return {
            title: "Checkout",
            description: "Complete your purchase"
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

    const { id } = await params

    const storeData = await getStoreDataByStoreNameOrId(id);

    if (!storeData) {
        return NotFound();
    }

    const cartData = await getCurrentCart(storeData.id);

    const productsData: ProductDataFull = await getCurrentProducts(storeData.id);

    return (
        <CartProvider
            cart={cartData}
            storeId={storeData.id}
        >
            <ProductDialogProvider
                productsDataServer={productsData}
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
        </CartProvider>
    );
}