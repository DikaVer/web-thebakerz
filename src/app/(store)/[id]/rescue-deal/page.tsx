import React, {Suspense} from "react";
import RescueDealSettings from "@/components/settings/rescue-deal/rescue-settings";
import {getProductsAPI} from "@/lib/api/GET/products-api";
import {getProductsOrderAPI} from "@/lib/api/GET/products-api";
import {getRescueDeal} from "@/lib/actions/rescue-deal";
import {getTranslations} from "next-intl/server";
import {verifyStoreAccess} from "../store-utils";
import NotFound from "@/app/(error_layout)/not-found";

interface StorePageProps {
    params: Promise<{
        id: string
    }>;
}

export default async function Page(props: StorePageProps) {
    const params = await props.params;
    const t = await getTranslations("RescueDealSettings");

    const { id } = await params;

    // Verify user has access to this store
    const storeData = await verifyStoreAccess(id);
    if (!storeData) {
        return NotFound();
    }

    const [productsData, productsOrder, existingRescueDeal] = await Promise.all([
        getProductsAPI(storeData.id),
        getProductsOrderAPI(storeData.id),
        getRescueDeal(storeData.id)
    ]);

    return (
        <div className="flex flex-col min-h-screen relative items-center container mx-auto justify-center">
            <div className="w-full max-w-2xl justify-center flex-1 py-4">
                {/* Title */}
                <div className="flex items-center gap-x-3">
                    <h1 className="text-3xl font-bold leading-9 text-default-foreground">{t("RescueDealManager")}</h1>
                </div>
                <h2 className="mt-2 text-small text-default-500">
                    {t("RescueProductsDescription")}
                </h2>
                {/* Tabs */}
                <Suspense fallback={undefined}>
                    <RescueDealSettings
                        productsData={productsData}
                        productsOrder={productsOrder}
                        initialRescueDeal={existingRescueDeal}
                    />
                </Suspense>
            </div>
        </div>
    );
}