import React, {Suspense} from "react";
import {ProductComponentBase} from "@/components/store/product/product-comp";
import {Spacer} from "@heroui/react";
import {getCurrentStoreId} from "@/lib/api/store-api";
import NotFound from "@/app/(error_layout)/not-found";
import {StoreTop} from "@/components/store/store-header/store-top";
import { FooterStore } from "@/components/footer-store";
import {ProductListSkeleton} from "@/components/skeleton/product-list-skeleton";
import {getTranslations} from "next-intl/server";
import { exampleStore } from "@/lib/local-variables";
import { DeliverySubheader } from "@/components/store/store-header/delivery-subheader";

interface StorePageProps {
    params: Promise<{
        id: string
    }>,
    searchParams?: Promise<{
        tab?: string;
        minPrice?: string;
        maxPrice?: string;
        categories?: string;
        allergies?: string;
        dietary?: string;
    }>;
}

export default async function Page(props: StorePageProps) {
    const searchParams = await props.searchParams;
    const params = await props.params;
    const t = await getTranslations("app/(store)/id");

    const { id } = await params;

    const storeData = await getCurrentStoreId(id);

    if (!storeData) {
        return <NotFound />;
    }

    return (
        <>
            <div className="flex flex-col min-h-screen relative z-10 items-center">
                <div className="flex flex-col container mx-auto items-center justify-center">
                    <Spacer y={2}/>
                    <StoreTop />
                    {exampleStore.includes(storeData.id) && (
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
                        <ProductComponentBase 
                            storeId={storeData.id} 
                            searchParams={searchParams}
                        />
                    </Suspense>
                    <Spacer y={6}/>
                    <DeliverySubheader />
                </div>
                <Spacer y={16}/>
                <FooterStore/>
            </div>
        </>
    );
}