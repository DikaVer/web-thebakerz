
import React, {Suspense} from "react";
import {ProductCard} from "@/components/settings/products/product-card";
import ProductTableSkeleton from "@/components/skeleton/product-table";
import {getCurrentProducts, getProductsByStoreId} from "@/lib/actions/product";
import {getCurrentSession} from "@/lib/actions/session";
import {getCurrentProductsOrder, getProductsOrder} from "@/lib/actions/order-products";

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

    const session = await getCurrentSession();

    const productsData = await getCurrentProducts(session?.store?.id ? session?.store?.id : id);

    const productsOrder = await getCurrentProductsOrder(session?.store?.id ? session?.store?.id : id);


    return (
        <div className="flex flex-col min-h-screen relative items-center container mx-auto justify-center">
            <div className="w-full max-w-2xl justify-center flex-1 py-4">
                {/* Title */}
                <div className="flex items-center gap-x-3">
                    <h1 className="text-3xl font-bold leading-9 text-default-foreground">Product Settings</h1>
                </div>
                <h2 className="mt-2 text-small text-default-500">
                    Customize your products and categories.
                </h2>
                {/* Tabs */}
                <Suspense fallback={<ProductTableSkeleton />}>
                    <ProductCard
                        productsData={productsData}
                        productsOrder={productsOrder}
                    />
                </Suspense>
            </div>
        </div>
    );
}
