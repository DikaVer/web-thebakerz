"use client";

import ViewHeaderStore from "@/components/dashboard/store/header-view";
import {ProfileHeaderBakerz} from "@/components/store/profile-header";
import {formatAddress} from "@/lib/utils";
import {Tabs, TabsContent, TabsList, TabsTrigger} from "@/components/ui/tabs";
import StoreAddresses from "@/components/dashboard/store/store-address";
import React, {useState} from "react";
import StoreEdit from "@/components/dashboard/store/store-edit";


export default function StoreViewDashboard({ storeData }: { storeData: any }) {

    const [store, setStore] = useState(storeData.store);
    const [user, setUser] = useState(storeData.user);
    const [location, setLocation] = useState(storeData.location);
    const [products, setProducts] = useState(storeData.products);
    const [availability, setAvailability] = useState(storeData.availability);
    const [deliveryOptions, setDeliveryOptions] = useState(storeData.deliveryOptions);

    return (
        <div>
            <ViewHeaderStore store_id={store.id} />
            <ProfileHeaderBakerz storeData={{
                name: user.name,
                description: store.description ? store.description : undefined,
                location: formatAddress(location),
                image: user.image ? user.image : '/avatars/store_1.jpg',
                background_url: store.background_url ? store.background_url : '/background_test.jpg'
            }} />
            <Tabs defaultValue="store" className="w-full mt-4">
                <TabsList className="grid w-full grid-cols-5">
                    <TabsTrigger value="store">Store</TabsTrigger>
                    <TabsTrigger value="location">Location</TabsTrigger>
                    <TabsTrigger value="products">Products</TabsTrigger>
                    <TabsTrigger value="availability">Availability</TabsTrigger>
                    <TabsTrigger value="delivery">Delivery</TabsTrigger>
                </TabsList>
                <TabsContent value="store">
                    <StoreEdit
                        store={store}
                        setStore={setStore}
                        user={user}
                        setUser={setUser}
                    />
                </TabsContent>
                <TabsContent value="location">
                    <StoreAddresses
                        address={location}
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