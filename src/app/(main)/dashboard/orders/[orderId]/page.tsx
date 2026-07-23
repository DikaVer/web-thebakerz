/**
 * @fileoverview Admin dashboard order detail page at /dashboard/orders/[orderId].
 *
 * Server component that requires storeId and email search params, fetches the
 * order via getOrderAPI, and renders it with OrderOverview; missing params or
 * a missing order render the NotFound page. Metadata marks the page as
 * noindex.
 */
import React from "react";
import NotFound from "@/app/(error_layout)/not-found";
import {OrderOverview} from "@/components/store/orders/overview/order-overview";
import { getOrderAPI } from "@/lib/api/GET/order-api";

interface StorePageProps {
    params: Promise<{
        orderId: string
    }>
    searchParams: Promise<{
        storeId?: string;
        email?: string;
        from?: string;
        to?: string;
    }>
}

export async function generateMetadata({ params }: {
    params: Promise<{ orderId: string }>
}) {

    return {
        title: `Order Details | TheBakerz`,
        description: `View order details for your purchase at TheBakerz`,
        robots: {
            index: false,
            follow: false
        }
    };
}


export default async function Page(props: StorePageProps) {
    const searchParams = await props.searchParams;
    const params = await props.params;

    const { orderId} = params;
    const { email, to, from, storeId } = searchParams;

    if (!email || !orderId || !storeId) {
        return NotFound();
    }

    const orderData = await getOrderAPI(storeId, orderId, email);

    if (!orderData) {
        return NotFound();
    }

    return (
        <div className="flex flex-col min-h-screen relative z-10 items-center">
            <OrderOverview
                isStore={false}
                orderData={orderData}
                from={from}
                to={to}
            />
        </div>
    );
}