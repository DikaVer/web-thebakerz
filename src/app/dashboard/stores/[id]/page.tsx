"use server";
import React, {Suspense} from "react";
import {auth} from "@/auth";
import StoreSkeleton from "@/components/skeletons";
import StoreTransit from "@/components/store-transit";
import {ProductDialogProvider} from "@/components/providers/product-provider";

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
        <ProductDialogProvider>
                <Suspense fallback={<StoreSkeleton/>}>
                    <StoreTransit
                        id={params.id}
                        userId={undefined}
                        // @ts-ignore
                        role={session?.user?.role}
                        isDashboard={true}
                        tab={searchParams?.tab}
                    />
                </Suspense>
        </ProductDialogProvider>
    );
}