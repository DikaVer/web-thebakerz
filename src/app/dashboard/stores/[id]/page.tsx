import {notFound} from "next/navigation";
import React, {Suspense} from "react";
import {fetchStoreData} from "@/lib/actions-server-only/store-actions";
import StoreViewDashboard from "@/components/dashboard/store/store-view";
import ProfileHeaderSkeleton from "@/components/skeletons";

export const revalidate = 0;

interface UserPageProps {
    params: {
        id: string
    }
}

export default async function Page({params}: UserPageProps) {

    const storeData = await fetchStoreData(params.id);

    if (!storeData) {
        return notFound();
    }


    return (
        <div className="max-w-2xl mx-auto bg-white shadow-md rounded-lg p-6">
            <Suspense fallback={<ProfileHeaderSkeleton/>}>
                <StoreViewDashboard storeProps={storeData} />
            </Suspense>
        </div>
    );

}