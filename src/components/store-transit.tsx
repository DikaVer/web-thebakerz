import {notFound} from "next/navigation";
import React from "react";
import {fetchStoreData} from "@/lib/actions-server-only/store-actions";
import StoreViewBakerz, {StoreViewUser} from "@/components/store/store-view";
import ViewHeaderStore from "@/components/dashboard/store/header-view";
import {fetchUserLocationProducts} from "@/lib/actions-server-only/user-actions";

interface StorePageProps {
    id: string
    userId: string | undefined
    role: string | undefined
    isDashboard: boolean
    tab?: string
}

export default async function StoreTransit({id, userId, role, isDashboard, tab}: StorePageProps) {

    const [storeData, userData] = await Promise.all([
        fetchStoreData(id),
        userId ? fetchUserLocationProducts(userId) : Promise.resolve(null)
    ]);


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
                                <StoreViewBakerz
                                    storeProps={storeData}
                                    tab={tab}
                                />
                            </>
                        ) : (
                            <StoreViewUser
                                storeData={storeData}
                                userData={
                                    {
                                        location: userData
                                    }
                                }

                            />
                        )
                    }
                </div>
            </div>
        );
    } else if (role === "bakerz") {
        return (
            <div className="flex flex-col min-h-screen">
                <div className="z-10 flex-grow container mx-auto pt-2">
                    <StoreViewBakerz
                        storeProps={storeData}
                        tab={tab}
                    />
                </div>
            </div>
        );
    } else {
        return (
            <div className="flex flex-col min-h-screen">
                <div className="z-10 flex-grow container mx-auto pt-2">

                    <StoreViewUser
                        storeData={storeData}
                        userData={
                            {
                                location: userData
                            }
                        }
                    />
                </div>
            </div>
        );
    }

}