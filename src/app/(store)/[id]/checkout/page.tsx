"use server";
import React, {Suspense} from "react";
import StoreSkeleton from "@/components/skeletons";
import CheckoutSteps from "@/components/checkout/checkout-steps";
import {generateStorePageMetadata} from "../store-utils";
import { getRescueDealMode } from "@/lib/actions/cookies/delivery-cookie";
import { getStoreIdAPI, getStoreScheduleAPI } from "@/lib/api/GET/store-api";
import { isWithinClosingWindow } from "@/lib/utils/helper/schedule-utils";
import NotFound from "@/app/(error_layout)/not-found";

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
    const { id } = params;

    const storeData = await getStoreIdAPI(id);

    if(!storeData){
        return <NotFound />;
    }

    const schedule = await getStoreScheduleAPI(storeData.id);

    // Check if current time is within 45 minutes of closing
    const isClosingSoon = isWithinClosingWindow(schedule);

    const isRescueDealMode = await getRescueDealMode();

    const isRescueDeal = isRescueDealMode && isClosingSoon;



    // The providers are now set up in the main layout
    return (
        <div className={'min-h-svh'}>
            <Suspense fallback={<StoreSkeleton/>}>
                <div className="flex flex-col min-h-screen relative z-10 items-center">
                    <div className="flex flex-col container mx-auto items-center my-4 min-h-screen max-w-2xl">
                        <CheckoutSteps
                            isRescueDeal={isRescueDeal}
                        />
                    </div>
                </div>
            </Suspense>
        </div>
    );
}