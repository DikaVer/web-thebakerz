import React, { Suspense } from "react";
import PromotionManager from "@/components/promotion/promotion-manager";
import { getProductsAPI, getProductsOrderAPI } from "@/lib/api/GET/products-api";
import { getPromotionGroups, getProductPromotionAssignments } from "@/lib/actions/promotions";
import { getLoyaltySettings, getLoyaltyItems, getProductLoyaltyItemAssignments } from "@/lib/actions/loyalty";
import { getTranslations } from "next-intl/server";
import { verifyStoreAccess } from "../store-utils";
import NotFound from "@/app/(error_layout)/not-found";

interface StorePageProps {
    params: Promise<{
        id: string
    }>;
}

export default async function Page(props: StorePageProps) {
    const params = await props.params;
    const t = await getTranslations("PromotionSettings");

    const { id } = await params;

    // Verify user has access to this store
    const storeData = await verifyStoreAccess(id);
    if (!storeData) {
        return NotFound();
    }

    const [productsData, productsOrder, promotionGroups, productAssignments, loyaltySettings, loyaltyItems, loyaltyAssignments] = await Promise.all([
        getProductsAPI(storeData.id),
        getProductsOrderAPI(storeData.id),
        getPromotionGroups(storeData.id),
        getProductPromotionAssignments(storeData.id),
        getLoyaltySettings(storeData.user_id),
        getLoyaltyItems(storeData.user_id),
        getProductLoyaltyItemAssignments(storeData.id)
    ]);

    return (
        <div className="flex flex-col min-h-screen relative items-center container mx-auto justify-center">
            <div className="w-full max-w-4xl justify-center flex-1 py-4">
                {/* Title */}
                <div className="flex items-center gap-x-3">
                    <h1 className="text-3xl font-bold leading-9 text-default-foreground">{t("PromotionManager")}</h1>
                </div>
                <h2 className="mt-2 text-small text-default-500">
                    {t("PromotionDescription")}
                </h2>
                {/* Promotion Manager Component */}
                <Suspense fallback={undefined}>
                    <PromotionManager
                        storeId={storeData.id}
                        userId={storeData.user_id}
                        productsData={productsData}
                        productsOrder={productsOrder}
                        initialPromotionGroups={promotionGroups.data || []}
                        initialProductAssignments={productAssignments.data || []}
                        initialLoyaltySettings={loyaltySettings.data}
                        initialLoyaltyItems={loyaltyItems.data || []}
                        initialLoyaltyAssignments={loyaltyAssignments.data || []}
                    />
                </Suspense>
            </div>
        </div>
    );
}