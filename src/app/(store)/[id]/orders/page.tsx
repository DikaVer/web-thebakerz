import React, {Suspense} from "react";
import {getOrderTime} from "@/app/(store)/[id]/actions";
import StoreSkeleton from "@/components/skeletons";
import {ProductComponentBase} from "@/components/store/product/product-comp";
import {Spacer} from "@heroui/react";
import {getCurrentStore} from "@/lib/actions/store";
import NotFound from "@/app/(error_layout)/not-found";
import {getCurrentCart} from "@/lib/actions/cart";
import {StoreProvider} from "@/components/providers/store-provider";
import LayoutComp from "@/components/layout-comp";
import {ProductDialogProvider} from "@/components/providers/product-provider";
import {StoreTop} from "@/components/store/store-header/store-top";
import { FooterStore } from "@/components/footer-store";
import {CartProvider} from "@/components/providers/cart-provider";
import {OrderDashboard} from "@/components/store/orders/dashboard/order-dashboard";

interface StorePageProps {
    params: Promise<{
        id: string
    }>,
    searchParams?: Promise<{
        date?: string;
    }>;
}


export default async function Page(props: StorePageProps) {
    const searchParams = await props.searchParams;
    const params = await props.params;

    const { id } = await params
    const { date } = searchParams || { date: undefined };


    return (
        <div className="flex flex-col min-h-dvh relative z-10 items-center">
            <OrderDashboard
                date={date}
            />
        </div>
    );
}

