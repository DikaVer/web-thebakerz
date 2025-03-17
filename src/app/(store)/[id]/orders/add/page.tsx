import React, {Suspense} from "react";

import {getCurrentSession} from "@/lib/actions/session";
import {getCurrentProducts} from "@/lib/actions/product";
import {getCurrentProductsOrder} from "@/lib/actions/order-products";

import CartOrderComp from "@/components/store/orders/add/cart-order-comp";

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

    const { id } = params

    const session = await getCurrentSession();

    const productsData = await getCurrentProducts(session?.store?.id ? session?.store?.id : id);

    const productsOrder = await getCurrentProductsOrder(session?.store?.id ? session?.store?.id : id);

    return (
        <div className="flex flex-col min-h-screen relative items-center container mx-auto justify-center">

            <div className="w-full max-w-2xl justify-center flex-1 py-4">
                {/* Title */}
                <div className="flex items-center gap-x-3">
                    <h1 className="text-3xl font-bold leading-9 text-default-foreground">Add Order</h1>
                </div>
                <h2 className="mt-2 text-small text-default-500">
                    Create a cart and add to your order list.
                </h2>
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