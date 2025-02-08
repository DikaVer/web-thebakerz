"use server";
import React, {Suspense} from "react";

import StoreSkeleton from "@/components/skeletons";

import {getCurrentSession} from "@/lib/actions/session";

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

    const session = await getCurrentSession();

    return (
        <div>
            <Suspense fallback={<StoreSkeleton/>}>

            </Suspense>
        </div>
    );
}