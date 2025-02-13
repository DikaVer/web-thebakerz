"use server";
import React, {Suspense} from "react";
import {StoreHeader} from "@/components/store/store-header/store-header";
import {StoreSubHeader} from "@/components/store/store-header/store-subheader";
import {getOrderTime} from "@/app/(store)/[id]/actions";
import StoreSkeleton from "@/components/skeletons";
import {ProductComponentBase} from "@/components/store/product/product-comp";
import {Spacer} from "@heroui/react";


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

    const id = params.id;

    const {date, time} = await getOrderTime()

    return (
        <div className="flex flex-col min-h-screen relative z-10 items-center">
            <div className="flex flex-col container mx-auto items-center justify-center">
                <Spacer y={8}/>
                <StoreHeader/>
                <StoreSubHeader
                    dateParam={date}
                    timeParam={time}
                />
                <Spacer y={8}/>
                <Suspense fallback={<StoreSkeleton/>}>
                    <ProductComponentBase
                        storeName={id}
                    />
                </Suspense>
                <Spacer y={8}/>
            </div>
        </div>
    );
}