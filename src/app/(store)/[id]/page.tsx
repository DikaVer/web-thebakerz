import React from "react";
import { ProfileHeader } from "@/components/store/profile-header";
import { notFound } from 'next/navigation';
import {getStore} from "@/lib/store/store-dto";
import {ProductComponent} from "@/components/store/product-comp";

interface StorePageProps {
    params: {
        id: string
    }
}

export default async function Page({params}: StorePageProps) {

    const storeData = await getStore(params.id);

    if (!storeData) {

        return notFound();

    } else {
        return (
            <div className="flex flex-col min-h-screen">
                <div className="z-10 flex-grow container mx-auto pt-2">
                    <ProfileHeader storeData={storeData}/>
                    <ProductComponent id={params.id}/>
                </div>
            </div>
        );
    }
}