"use client";

import ViewHeaderStore from "@/components/dashboard/store/header-view";
import {ProfileHeaderBakerz} from "@/components/store/profile-header";
import {Tabs, TabsContent, TabsList, TabsTrigger} from "@/components/ui/tabs";
import StoreAddresses from "@/components/dashboard/store/store-address";
import React, {useMemo, useState} from "react";
import StoreEdit from "@/components/dashboard/store/store-edit";
import {StoreData} from "@/lib/definitions";


interface StoreViewDashboardProps {
    storeProps: StoreData,
}


export default function StoreViewDashboard({storeProps}: StoreViewDashboardProps) {

    const [storeData, setStoreData] = useState<StoreData>(storeProps);

    const initialStoreValues = useMemo(() => {
        return storeData;
    }, []);

    return (
        <div id="main">
            <ViewHeaderStore store_id={storeData.id} />
            <ProfileHeaderBakerz
                name={storeData.name}
                description={storeData.description}
                location={storeData.location}
                image={storeData.image}
                background_url={storeData.background_url}
                deliveryOptions={storeData.deliveryOptions}
                availability={storeData.availability}
            />
            <Tabs defaultValue="store" className="w-full mt-4">
                <TabsList className="grid w-full grid-cols-5" onClick={
                    () => {
                        setStoreData(initialStoreValues);
                    }
                }>
                    <TabsTrigger value="store">Store</TabsTrigger>
                    <TabsTrigger value="location">Location</TabsTrigger>
                    <TabsTrigger value="products">Products</TabsTrigger>
                    <TabsTrigger value="availability">Availability</TabsTrigger>
                    <TabsTrigger value="delivery">Delivery</TabsTrigger>
                </TabsList>
                <TabsContent value="store">
                    <StoreEdit
                        id={storeData.id}
                        user_id={storeData.user_id}
                        name={storeData.name}
                        description={storeData.description}
                        image={storeData.image}
                        background_url={storeData.background_url}
                        nickname={storeData.nickname}
                        setStoreData={setStoreData}
                    />
                </TabsContent>
                <TabsContent value="location">
                    <StoreAddresses
                        address={storeData.location}
                    />
                </TabsContent>
                <TabsContent value="products">

                </TabsContent>
                <TabsContent value="availability">

                </TabsContent>
                <TabsContent value="delivery">

                </TabsContent>

            </Tabs>
        </div>
    );
}