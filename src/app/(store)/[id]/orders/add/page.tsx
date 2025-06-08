import React, {Suspense} from "react";

import {getCurrentProducts} from "@/lib/api/products-api";
import {getCurrentProductsOrder} from "@/lib/api/products-api";

import CartOrderComp from "@/components/store/orders/add/cart-order-comp";
import {getCurrentStore} from "@/lib/api/store-api";
import {verifyStoreAccess} from "@/app/(store)/[id]/store-utils";
import NotFound from "@/app/(error_layout)/not-found";

interface StorePageProps {
    params: Promise<{
        id: string
    }>,
    searchParams?: Promise<{
        tab?: string;
    }>;
}

export async function generateMetadata({ params }: {
    params: Promise<{ id: string }>
}) {
    const { id } = await params;

    const storeData = await getCurrentStore(id);

    if (!storeData) {
        return {
            title: "Add Order",
            description: "Create a new order"
        };
    }

    return {
        title: `Add Order | ${storeData.ownerName}`,
        description: `Create a new order at ${storeData.ownerName}`,
        robots: {
            index: false,
            follow: false
        }
    };
}


export default async function Page(props: StorePageProps) {
    const searchParams = await props.searchParams;
    const params = await props.params;


    const { id } = params

    const storeData = await verifyStoreAccess(id);
    if (!storeData) {
        return NotFound();
    }

    const productsData = await getCurrentProducts(storeData.id);

    const productsOrder = await getCurrentProductsOrder(storeData.id);

    return (
        <div className="flex flex-col min-h-screen relative items-center container mx-auto justify-center">

            <div className="w-full max-w-2xl justify-center flex-1 py-4">
                {/* Tabs */}
                <Suspense fallback={undefined}>
                    <CartOrderComp
                        productsOrder={productsOrder}
                        productsData={productsData}
                        />
                </Suspense>
            </div>
        </div>

    );
}