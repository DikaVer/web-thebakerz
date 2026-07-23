/**
 * @fileoverview Product creation page rendered at /[id]/item/add-item.
 *
 * Server component that loads the store by slug (rendering NotFound if it
 * does not exist), fetches its products and product ordering, and renders
 * the ItemAddManager component for adding and managing store products.
 */
import React, { Suspense } from "react";
import { getProductsAPI } from "@/lib/api/GET/products-api";
import { getProductsOrderAPI } from "@/lib/api/GET/products-api";
import { getTranslations } from "next-intl/server";
import ItemAddManager from "@/components/store/add-item/item-add-manager";
import NotFound from "@/app/(error_layout)/not-found";
import { getStoreIdAPI } from "@/lib/api/GET/store-api";

interface StorePageProps {
    params: Promise<{
        id: string
    }>,
    searchParams?: Promise<{
        tab?: string;
    }>;
}

export default async function Page({ params, searchParams }: StorePageProps) {
    const { id } = await params;
    const t = await getTranslations("ProductAdd");

    const storeData = await getStoreIdAPI(id);
    if (!storeData) {
        return <NotFound />;
    }

    const productsData = await getProductsAPI(storeData.id);
    const productsOrder = await getProductsOrderAPI(storeData.id);

    return (
        <div className="flex flex-col min-h-screen relative items-center container mx-auto justify-center">
            <div className="w-full max-w-2xl justify-center flex-1 py-4">
                {/* Title */}
                <div className="flex items-center gap-x-3">
                    <h1 className="text-3xl font-bold leading-9 text-default-foreground">{t("ProductAdd")}</h1>
                </div>
                <h2 className="mt-2 text-small text-default-500">
                    {t("ManageProductsDescription")}
                </h2>
                {/* Tabs */}
                <Suspense fallback={undefined}>
                    <ItemAddManager
                        productsData={productsData}
                        productsOrder={productsOrder}
                    />
                </Suspense>
            </div>
        </div>
    );
}