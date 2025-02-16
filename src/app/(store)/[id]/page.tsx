"use server";
import React, {Suspense} from "react";
import {StoreHeader} from "@/components/store/store-header/store-header";
import {StoreSubHeader} from "@/components/store/store-header/store-subheader";
import {getOrderTime} from "@/app/(store)/[id]/actions";
import StoreSkeleton from "@/components/skeletons";
import {ProductComponentBase} from "@/components/store/product/product-comp";
import {Spacer} from "@heroui/react";
import {getStoreDataByStoreNameOrId} from "@/lib/actions/store";
import NotFound from "@/app/(error_layout)/not-found";
import {getCart} from "@/lib/actions/cart";
import {StoreProvider} from "@/components/providers/store-provider";
import LayoutComp from "@/components/layout-comp";
import {Footer} from "@/components/footer";
import {ProductDialogProvider} from "@/components/providers/product-provider";


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

    const { id } = await params

    const storeData = await getStoreDataByStoreNameOrId(id);

    if (!storeData) {
        return NotFound();
    }

    const cartData = await getCart(storeData.id);

    const {date, time} = await getOrderTime()

    return (
        <ProductDialogProvider
            cart={cartData}
            storeId={storeData.id}
        >
            <StoreProvider
                store={storeData}
            >
                <LayoutComp
                    store={storeData}
                >
                    <div className="flex flex-col min-h-screen relative z-10 items-center">
                        <div className="flex flex-col container mx-auto items-center justify-center">
                            <Spacer y={8}/>
                            <div className={'flex flex-col md:flex-row w-full items-center md:justify-between'}>
                                <StoreHeader/>
                                <StoreSubHeader
                                    dateParam={date}
                                    timeParam={time}
                                />
                            </div>
                            <Spacer y={8}/>
                            <Suspense fallback={<StoreSkeleton/>}>
                                <ProductComponentBase
                                    storeId={storeData.id}
                                />
                            </Suspense>
                        </div>
                        <Spacer y={16}/>
                    </div>
                    <Footer/>
                </LayoutComp>
            </StoreProvider>
        </ProductDialogProvider>
    );
}