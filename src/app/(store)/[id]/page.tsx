import React, {Suspense} from "react";
import {getOrderTime} from "@/app/(store)/[id]/actions";
import StoreSkeleton from "@/components/skeletons";
import {ProductComponentBase} from "@/components/store/product/product-comp";
import {Spacer} from "@heroui/react";
import {getCurrentStore} from "@/lib/actions/store";
import NotFound from "@/app/(error_layout)/not-found";
import {StoreTop} from "@/components/store/store-header/store-top";
import { FooterStore } from "@/components/footer-store";
import {ProductListSkeleton} from "@/components/skeleton/product-list-skeleton";
import {useTranslations} from "next-intl";
import {getTranslations} from "next-intl/server";
import { examppleStore } from "@/lib/local-variables";

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
    const t = await getTranslations("app/(store)/id");

    const { id } = await params;

    const storeData = await getCurrentStore(id);

    if (!storeData) {
        return <NotFound />;
    }

    // The store data is now fetched in the layout
    // We don't need to fetch it again or set up providers

    return (
        <div className="flex flex-col min-h-screen relative z-10 items-center">
            <div className="flex flex-col container mx-auto items-center justify-center">
                <Spacer y={8}/>
                <StoreTop />
                {examppleStore.includes(storeData.id) && (
                    <>
                        <Spacer y={4}/>
                        <div className="w-full flex flex-col items-start justify-start">
                            <div className="w-full max-w-4xl bg-amber-100 border-l-4 border-amber-500 text-amber-700 p-4 rounded-md shadow-sm">
                                <p className="font-medium">{t("example-store")}</p>
                            </div>
                        </div>
                    </>
                )}
                <Spacer y={4}/>
                
                <Suspense fallback={<ProductListSkeleton />}>
                    <ProductComponentBase storeId={storeData.id} />
                </Suspense>
            </div>
            <Spacer y={16}/>
            <FooterStore/>
        </div>
    );
}