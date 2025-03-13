import React from "react";
import NotFound from "@/app/(error_layout)/not-found";
import {getCurrentOrder} from "@/lib/actions/order";
import {getCurrentStore} from "@/lib/actions/store";

interface StorePageProps {
    params: Promise<{
        id: string
        orderId: string
    }>
    searchParams: Promise<{
        email?: string;
    }>
}


export default async function Page(props: StorePageProps) {
    const searchParams = await props.searchParams;
    const params = await props.params;

    const { id, orderId } = params;
    const { email } = searchParams;

    if (!email || !id || !orderId) {
        return NotFound();
    }

    const storeData = await getCurrentStore(id);

    if (!storeData) {
        return NotFound();
    }

    const orderData = await getCurrentOrder(storeData.id, orderId, email);

    console.log("storeData", orderData);

    return (
        <div className="flex flex-col min-h-screen relative z-10 items-center">

        </div>
    );
}