"use server";
import React, {Suspense} from "react";
import {auth} from "@/auth";
import StoreSkeleton from "@/components/skeletons";
import CheckoutTransit from "@/components/store/checkout/checkout-transit";

interface StorePageProps {
    params: {
        id: string
    },
    searchParams?: {
        tab?: string;
    };
}

export default async function Page({params, searchParams}: StorePageProps) {

    const session = await auth();

    return (
        <div>
            <Suspense fallback={<StoreSkeleton/>}>
                <CheckoutTransit
                    id={params.id}
                    userId={session?.user?.id}
                    // @ts-ignore
                    role={session?.user?.role}
                    tab={searchParams?.tab}
                />
            </Suspense>
        </div>
    );
}