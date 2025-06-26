import React from "react";
import NotFound from "@/app/(error_layout)/not-found";
import {getOrderAPI} from "@/lib/api/GET/order-api";
import {getStoreIdAPI} from "@/lib/api/GET/store-api";
import {OrderOverview} from "@/components/store/orders/overview/order-overview";

interface StorePageProps {
    params: Promise<{
        id: string
        orderId: string
    }>
    searchParams: Promise<{
        email?: string;
        from?: string;
        to?: string;
    }>
}

export async function generateMetadata({ params }: {
    params: Promise<{ id: string, orderId: string }>
}) {
    const { id } = await params;

    const storeData = await getStoreIdAPI(id);

    if (!storeData) {
        return {
            title: "Order Not Found",
            description: "The requested order could not be found."
        };
    }

    return {
        title: `Order Details | ${storeData.ownerName}`,
        description: `View order details for your purchase at ${storeData.ownerName}`,
        robots: {
            index: false,
            follow: false
        }
    };
}


export default async function Page(props: StorePageProps) {
    const searchParams = await props.searchParams;
    const params = await props.params;

    const { id, orderId } = params;
    const { email, to, from } = searchParams;

    if (!email || !id || !orderId) {
        return NotFound();
    }

    const storeData = await getStoreIdAPI(id);

    if (!storeData) {
        return NotFound();
    }

    const orderData = await getOrderAPI(storeData.id, orderId, email);

    if (!orderData) {
        return NotFound();
    }

    return (
        <div className="flex flex-col min-h-screen relative z-10 items-center">
            <OrderOverview
                orderData={orderData}
                from={from}
                to={to}
            />
        </div>
    );
}