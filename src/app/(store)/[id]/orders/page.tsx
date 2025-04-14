import React from "react";

import { FooterStore } from "@/components/footer-store";

import {OrderDashboard} from "@/components/store/orders/dashboard/order-dashboard";

interface StorePageProps {
    params: Promise<{
        id: string
    }>,
    searchParams?: Promise<{
        date?: string;
        from?: string;
        to?: string;
    }>;
}


export default async function Page(props: StorePageProps) {
    const searchParams = await props.searchParams;
    const params = await props.params;

    const { id } = await params
    const { date, from, to } = searchParams || { date: undefined, from: undefined, to: undefined };


    return (
        <>
            <div className="flex flex-col min-h-dvh relative z-10 items-center">
                <OrderDashboard
                    date={date}
                    from={from}
                    to={to}
                />
            </div>
            <FooterStore/>
        </>
    );
}

