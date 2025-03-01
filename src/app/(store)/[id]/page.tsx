import React, {Suspense} from "react";
import {StoreHeader} from "@/components/store/store-header/store-header";
import {StoreSubHeader} from "@/components/store/store-header/store-subheader";
import {getOrderTime} from "@/app/(store)/[id]/actions";
import StoreSkeleton from "@/components/skeletons";
import {ProductComponentBase} from "@/components/store/product/product-comp";
import {Spacer} from "@heroui/react";
import {getCurrentStore, getStoreDataByStoreNameOrId} from "@/lib/actions/store";
import NotFound from "@/app/(error_layout)/not-found";
import {getCart, getCurrentCart} from "@/lib/actions/cart";
import {StoreProvider} from "@/components/providers/store-provider";
import LayoutComp from "@/components/layout-comp";
import {ProductDialogProvider} from "@/components/providers/product-provider";
import {FooterSimple} from "@/components/footer-simple";

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

    const storeData = await getCurrentStore(id);

    if (!storeData) {
        return NotFound();
    }

    const cartData = await getCurrentCart(storeData.id);

    const {date, time} = await getOrderTime()

    // console.log('storeData', storeData)

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
                            <div className={'flex flex-col gap-y-8 md:flex-row w-full md:justify-between'}>
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
                    <FooterSimple/>
                </LayoutComp>
            </StoreProvider>
        </ProductDialogProvider>
    );
}