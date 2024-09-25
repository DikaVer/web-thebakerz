"use server";

import {notFound} from "next/navigation";
import React from "react";
import {fetchStoreData} from "@/lib/actions-server-only/store-actions";
import StoreViewDashboard from "@/components/dashboard/store/store-view";


interface UserPageProps {
    params: {
        id: string
    }
}

export default async function Page({params}: UserPageProps) {

    const storeData = await fetchStoreData(params.id);

    console.log(storeData);

    if (storeData.error) {
        return notFound();
    }


    return (
        <div className="max-w-2xl mx-auto bg-white shadow-md rounded-lg p-6">
            <StoreViewDashboard storeData={storeData} />
        </div>
    );

}