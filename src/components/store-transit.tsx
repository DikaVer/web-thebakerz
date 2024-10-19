import {notFound} from "next/navigation";
import React from "react";
import {fetchStoreData} from "@/lib/actions-server-only/store-actions";
import StoreViewBakerz, {StoreViewUser} from "@/components/dashboard/store/store-view";
import ViewHeaderStore from "@/components/dashboard/store/header-view";

interface StorePageProps {
    id: string
    role: string | undefined
    isDashboard: boolean
}

export default async function StoreTransit({id, role, isDashboard}: StorePageProps) {

    const storeData = await fetchStoreData(id);

    if (!storeData) {
        return notFound();
    }

    if (role === "admin") {
        return (
            <div className="flex flex-col min-h-screen">
                <div className="z-10 flex-grow container mx-auto pt-2">
                    { isDashboard ?
                        (
                            <>
                                <ViewHeaderStore store_id={storeData.id} />
                                <StoreViewBakerz storeProps={storeData}/>
                            </>
                        ) : (
                            <StoreViewUser storeProps={storeData}/>
                        )
                    }
                </div>
            </div>
        );
    } else if (role === "bakerz") {
        return (
            <div className="flex flex-col min-h-screen">
                <div className="z-10 flex-grow container mx-auto pt-2">
                    <StoreViewBakerz storeProps={storeData}/>
                </div>
            </div>
        );
    } else {
        return (
            <div className="flex flex-col min-h-screen">
                <div className="z-10 flex-grow container mx-auto pt-2">

                    <StoreViewUser storeProps={storeData}/>
                </div>
            </div>
        );
    }

}