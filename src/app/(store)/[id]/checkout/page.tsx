"use server";
import React, {Suspense} from "react";

import StoreSkeleton from "@/components/skeletons";

import {getCurrentSession} from "@/lib/actions/session";
import {Footer} from "@/components/footer";
import {getOrderTime} from "@/app/(store)/[id]/actions";
import CheckoutSteps from "@/components/checkout/checkout-steps";

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

    const {date, time} = await getOrderTime()

    return (
        <div className="flex flex-col min-h-screen relative z-10 items-center">
            <div className="flex flex-col container mx-auto items-center my-4 min-h-screen max-w-2xl">
                <CheckoutSteps
                    date={date}
                    time={time}
                />
            </div>
            <Footer/>
        </div>
    );
}