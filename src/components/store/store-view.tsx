"use client";

import {ProfileHeader, ProfileHeaderBakerz} from "@/components/store/profile-header";
import {Tabs, TabsContent, TabsList, TabsTrigger} from "@/components/ui/tabs";
import StoreAddresses from "@/components/dashboard/store/store-address";
import React, {useState} from "react";
import StoreEdit from "@/components/dashboard/store/store-edit";
import {StoreData} from "@/lib/definitions";
import AvailabilityEdit from "@/components/dashboard/store/availability-edit";
import DeliveryOptionsEdit from "@/components/dashboard/store/delivery-options-edit";
import ProductsStoreEdit from "@/components/dashboard/store/products-store-edit";
import {ProductComponentUser} from "@/components/user/product-comp";
import {usePathname, useRouter, useSearchParams} from "next/navigation";


interface StoreViewProps {
    storeProps: StoreData,
    tab?: string
}


export default function StoreViewBakerz({storeProps, tab}: StoreViewProps) {

    const [storeData, setStoreData] = useState<StoreData>(storeProps);

    const searchParams = useSearchParams();
    const pathname = usePathname();
    const { replace } = useRouter();


    return (
        <div id="main" className={"mb-4"}>
            <ProfileHeaderBakerz
                name={storeData.name}
                description={storeData.description}
                location={storeData.location}
                image={storeData.image}
                background_url={storeData.background_url}
                deliveryOptions={storeData.deliveryOptions}
                availability={storeData.availability}
            />
            <Tabs
                defaultValue={tab ? tab : "products"}
                className="w-full mt-4"
                onValueChange={(value) => {
                    const params = new URLSearchParams(searchParams);
                    params.set("tab", value);
                    replace(`${pathname}?${params.toString()}`);
                }}
            >
                <TabsList className="grid w-full grid-cols-5" >
                    <TabsTrigger value="store">Store</TabsTrigger>
                    <TabsTrigger value="location">Location</TabsTrigger>
                    <TabsTrigger value="products">Products</TabsTrigger>
                    <TabsTrigger value="availability">Availability</TabsTrigger>
                    <TabsTrigger value="delivery">Delivery</TabsTrigger>
                </TabsList>
                <TabsContent value="store">
                    <StoreEdit
                        id={storeData.id}
                        user_id={storeData.user_id ? storeData.user_id : ""}
                        name={storeData.name ? storeData.name : ""}
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
                    <ProductsStoreEdit
                        storeId={storeData.id}
                        productData={storeData.products}
                        setStoreData={setStoreData}
                        />
                </TabsContent>
                <TabsContent value="availability">
                    <AvailabilityEdit
                        id={storeData.id}
                        availability={storeData.availability}
                        setStoreData={setStoreData}
                    />
                </TabsContent>
                <TabsContent value="delivery">
                    <DeliveryOptionsEdit
                        id={storeData.id}
                        deliveryOptions={storeData.deliveryOptions}
                        setStoreData={setStoreData}
                    />
                </TabsContent>

            </Tabs>
        </div>
    );
}

export function StoreViewUser({storeProps}: StoreViewProps) {

    const [storeData, setStoreData] = useState<StoreData>(storeProps);


    return (
        <div className={"mb-4"}>
            <ProfileHeader
                name={storeData.name}
                description={storeData.description}
                location={storeData.location}
                image={storeData.image}
                background_url={storeData.background_url}
                deliveryOptions={storeData.deliveryOptions}
                availability={storeData.availability}
            />
            <ProductComponentUser
                storeId={storeData.id}
                productData={storeData.products}
            />

        </div>
    );
}