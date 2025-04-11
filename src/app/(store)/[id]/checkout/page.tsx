"use server";
import React, {Suspense} from "react";
import StoreSkeleton from "@/components/skeletons";
import CheckoutSteps from "@/components/checkout/checkout-steps";
import NotFound from "@/app/(error_layout)/not-found";
import {generateStorePageMetadata} from "../store-utils";

interface StorePageProps {
    params: Promise<{
        id: string
    }>,
    searchParams?: Promise<{
        tab?: string;
    }>;
}

export async function generateMetadata({ params }: { params: StorePageProps['params'] }) {
    const { id } = await params;
    return generateStorePageMetadata(id, 'Checkout', 'Complete your purchase', { index: false, follow: false });
}

export default async function Page(props: StorePageProps) {
    const params = await props.params;

    // The providers are now set up in the main layout
    return (
        <div className={'min-h-svh'}>
            <Suspense fallback={<StoreSkeleton/>}>
                <div className="flex flex-col min-h-screen relative z-10 items-center">
                    <div className="flex flex-col container mx-auto items-center my-4 min-h-screen max-w-2xl">
                        <CheckoutSteps/>
                    </div>
                </div>
            </Suspense>
        </div>
    );
}