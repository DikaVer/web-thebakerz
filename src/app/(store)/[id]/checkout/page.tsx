"use server";
import React, {Suspense} from "react";
import {auth} from "@/auth";
import StoreSkeleton from "@/components/skeletons";
import CheckoutTransit from "@/components/store/checkout/checkout-transit";

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

    const session = await auth();

    return (
        <div>
            <Suspense fallback={<StoreSkeleton/>}>
                <CheckoutTransit
                    id={params.id}
                    userId={session?.user?.id}
                    email={session?.user?.email}
                    // @ts-ignore
                    role={session?.user?.role}
                    tab={searchParams?.tab}
                />
            </Suspense>
        </div>
    );
}