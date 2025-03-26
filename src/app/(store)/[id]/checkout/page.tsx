"use server";
import React, {Suspense} from "react";

import StoreSkeleton from "@/components/skeletons";

import {getCurrentSession} from "@/lib/actions/session";
import {Footer} from "@/components/footer";
import {getOrderTime} from "@/app/(store)/[id]/actions";
import CheckoutSteps from "@/components/checkout/checkout-steps";
import {getStoreDataByStoreNameOrId} from "@/lib/actions/store";
import NotFound from "@/app/(error_layout)/not-found";
import {getCurrentCart} from "@/lib/actions/cart";
import {getCurrentProducts, ProductDataFull} from "@/lib/actions/product";
import {CartProvider} from "@/components/providers/cart-provider";
import { ProductDialogProvider } from "@/components/providers/product-provider";
import {StoreProvider} from "@/components/providers/store-provider";
import LayoutComp from "@/components/layout-comp";

interface StorePageProps {
    params: Promise<{
        id: string
    }>,
    searchParams?: Promise<{
        tab?: string;
    }>;
}

export default async function Page(props: StorePageProps) {
    const searchParams = await props.searchParams;
    const params = await props.params;

    const storeData = await getStoreDataByStoreNameOrId(params.id);

    if (!storeData) {
        return NotFound();
    }

    const cartData = await getCurrentCart(storeData.id);

    const productsData: ProductDataFull = await getCurrentProducts(storeData.id);

    const {date, time} = await getOrderTime(storeData.id)

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
                                <div className="flex flex-col min-h-screen relative z-10 items-center">
                                    <div className="flex flex-col container mx-auto items-center my-4 min-h-screen max-w-2xl">
                                        <CheckoutSteps
                                            date={date}
                                            time={time}
                                        />
                                    </div>
                                </div>
                            </Suspense>
                        </div>
                    </LayoutComp>
                </StoreProvider>
            </ProductDialogProvider>
        </CartProvider>
    );
}