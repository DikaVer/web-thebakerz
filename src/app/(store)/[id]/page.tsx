import React, {Suspense} from "react";
import {getOrderTime} from "@/app/(store)/[id]/actions";
import StoreSkeleton from "@/components/skeletons";
import {ProductComponentBase} from "@/components/store/product/product-comp";
import {Spacer} from "@heroui/react";
import {getCurrentStore} from "@/lib/actions/store";
import NotFound from "@/app/(error_layout)/not-found";
import {getCurrentCart} from "@/lib/actions/cart";
import {StoreProvider} from "@/components/providers/store-provider";
import LayoutComp from "@/components/layout-comp";
import {ProductDialogProvider} from "@/components/providers/product-provider";
import {StoreTop} from "@/components/store/store-header/store-top";
import { FooterStore } from "@/components/footer-store";
import {CartProvider} from "@/components/providers/cart-provider";
import {ProductListSkeleton} from "@/components/skeleton/product-list-skeleton";
import {useTranslations} from "next-intl";
import {getTranslations} from "next-intl/server";
import {getDeliveryMode} from "@/lib/delivery-cookie";
import {DeliveryProvider} from "@/components/providers/delivery-provider";
import {getCurrentDeliveryAddress} from "@/app/(store)/[id]/delivery-actions";

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
    const t = await getTranslations("app/(store)/[id]/page");

    const { id } = await params;

    const storeData = await getCurrentStore(id);

    if (!storeData) {
        return NotFound();
    }

    const cartData = await getCurrentCart(storeData.id);

    const deliveryMode = await getDeliveryMode();
    const savedAddress = await getCurrentDeliveryAddress(storeData.id);

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
                    <DeliveryProvider
                        initialDeliveryMode={deliveryMode === 'delivery'}
                        initialAddress={savedAddress}
                    >
                        <LayoutComp
                            store={storeData}
                        >
                            <div className="flex flex-col min-h-screen relative z-10 items-center">
                                <div className="flex flex-col container mx-auto items-center justify-center">
                                    <Spacer y={8}/>
                                    <StoreTop />
                                    <Spacer y={8}/>
                                    <Suspense fallback={<ProductListSkeleton />}>
                                        <ProductComponentBase storeId={storeData.id} />
                                    </Suspense>
                                </div>
                                <Spacer y={16}/>
                            </div>
                            <FooterStore/>
                        </LayoutComp>
                    </DeliveryProvider>
                </StoreProvider>
            </ProductDialogProvider>
        </CartProvider>
    );
}