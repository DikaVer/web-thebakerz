"use server";
import React, {Suspense} from "react";
import {auth} from "@/auth";
import StoreSkeleton from "@/components/skeletons";
import StoreTransit from "@/components/store-transit";

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
                <StoreTransit
                    id={params.id}
                    // @ts-ignore
                    role={session?.user?.role}
                    isDashboard={false}
                    tab={searchParams?.tab}
                />
            </Suspense>
        </div>
    );
}