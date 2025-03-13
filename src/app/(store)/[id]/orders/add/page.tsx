import React, {Suspense} from "react";
import {getOrderTime, updateOrderTime} from "@/app/(store)/[id]/actions";
import StoreSkeleton from "@/components/skeletons";
import {ProductComponentBase} from "@/components/store/product/product-comp";
import {Spacer} from "@heroui/react";
import {getCurrentStore} from "@/lib/actions/store";
import NotFound from "@/app/(error_layout)/not-found";
import {getCurrentCart, updateCart} from "@/lib/actions/cart";
import {StoreProvider} from "@/components/providers/store-provider";
import LayoutComp from "@/components/layout-comp";
import {ProductDialogProvider} from "@/components/providers/product-provider";
import {StoreTop} from "@/components/store/store-header/store-top";
import { FooterStore } from "@/components/footer-store";
import {CartProvider} from "@/components/providers/cart-provider";
import {getCurrentSession} from "@/lib/actions/session";
import {getCurrentProducts} from "@/lib/actions/product";
import {getCurrentProductsOrder} from "@/lib/actions/order-products";
import ProductTableSkeleton from "@/components/skeleton/product-table";
import {ProductCard} from "@/components/settings/products/product-card";
import ProductList from "@/components/store/orders/add/product-list";
import CheckoutOrder from "@/components/store/orders/add/checkout-order";
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
                <Suspense fallback={<ProductTableSkeleton />}>
                    <CartOrderComp
                        productsOrder={productsOrder}
                        productsData={productsData}
                        />
                </Suspense>
            </div>
        </div>

    );
}