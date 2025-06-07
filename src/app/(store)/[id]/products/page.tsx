import React, {Suspense} from "react";
import {ProductCard} from "@/components/settings/products/product-card";
import {getCurrentProducts} from "@/lib/api/products-api";
import {getCurrentProductsOrder} from "@/lib/actions/order-products";
import {getTranslations} from "next-intl/server";
import {verifyStoreAccess} from "../store-utils";
import NotFound from "@/app/(error_layout)/not-found";

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
    const t = await getTranslations("ProductSettings");

    const { id } = await params;

    // Verify user has access to this store
    const storeData = await verifyStoreAccess(id);
    if (!storeData) {
        return NotFound();
    }

    const productsData = await getCurrentProducts(storeData.id);
    const productsOrder = await getCurrentProductsOrder(storeData.id);

    return (
        <div className="flex flex-col min-h-screen relative items-center container mx-auto justify-center">
            <div className="w-full max-w-2xl justify-center flex-1 py-4">
                {/* Title */}
                <div className="flex items-center gap-x-3">
                    <h1 className="text-3xl font-bold leading-9 text-default-foreground">{t("ProductManager")}</h1>
                </div>
                <h2 className="mt-2 text-small text-default-500">
                    {t("ManageProductsDescription")}
                </h2>
                {/* Tabs */}
                <Suspense fallback={undefined}>
                    <ProductCard
                        productsData={productsData}
                        productsOrder={productsOrder}
                    />
                </Suspense>
            </div>
        </div>
    );
}