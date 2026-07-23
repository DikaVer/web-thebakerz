/**
 * @fileoverview Admin orders management page at /dashboard/orders.
 *
 * Server component that reads optional date/from/to search params and renders
 * the OrderDashboard component in non-store (admin) mode. Metadata marks the
 * page as noindex.
 */
import React from "react";

import {OrderDashboard} from "@/components/store/orders/dashboard/order-dashboard";

type Params = Promise<{ id: string  }>

export async function generateMetadata({ params }: {
    params: Promise<{ id: string }>
}) {
    const { id } = await params;

    return {
        title: `Orders Management | TheBakerz`,
        description: `Manage orders for TheBakerz`,
        robots: {
            index: false,
            follow: false
        }
    };
}

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
                    isStore={false}
                />
            </div>
        </>
    );
}

