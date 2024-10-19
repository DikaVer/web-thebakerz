"use server";
import React, {Suspense} from "react";
import {auth} from "@/auth";
import StoreSkeleton from "@/components/skeletons";
import StoreTransit from "@/components/store-transit";

interface StorePageProps {
    params: {
        id: string
    }
}

export default async function Page({params}: StorePageProps) {

    const session = await auth();

    return (
        <div>
            <Suspense fallback={<StoreSkeleton/>}>
                <StoreTransit
                    id={params.id}
                    // @ts-ignore
                    role={session?.user?.role}
                    isDashboard={false}
                />
            </Suspense>
        </div>
    );
}