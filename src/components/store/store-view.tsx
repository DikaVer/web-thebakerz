"use client";

import {ProfileHeader} from "@/components/store/profile-header";
import {Tabs, TabsContent, TabsList, TabsTrigger} from "@/components/ui/tabs";
import StoreAddresses from "@/components/store/maintaince/store-address";
import React, {useState} from "react";
import StoreEdit from "@/components/store/maintaince/store-edit";
import {AddressDataUserField, StoreData} from "@/lib/definitions";
import AvailabilityEdit from "@/components/store/maintaince/availability-edit";
import DeliveryOptionsEdit from "@/components/store/maintaince/delivery-options-edit";
import ProductsStoreEdit from "@/components/store/maintaince/products-store-edit";
import {usePathname, useRouter, useSearchParams} from "next/navigation";
import {ProductComponentUser} from "@/components/store/product/product-comp";


interface StoreViewBakerzProps {
    storeProps: StoreData,
    tab?: string
}


export default function StoreViewBakerz({storeProps, tab}: StoreViewBakerzProps) {

    const [storeData, setStoreData] = useState<StoreData>(storeProps);

    const searchParams = useSearchParams();
    const pathname = usePathname();
    const { replace } = useRouter();


    return (
        <div id="main" className={"mb-4"}>
            <ProfileHeader
                name={storeData.name}
                description={storeData.description}
                location={storeData.location}
                image={storeData.image}
                background_url={storeData.background_url}
                deliveryOptions={storeData.deliveryOptions}
                availability={storeData.availability}
                userLocation={null}
                variant={"bakerz"}
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


interface StoreViewUserProps {
    storeData: StoreData,
    userData: {
        location: AddressDataUserField[] | null
    }
}

export function StoreViewUser({storeData, userData}: StoreViewUserProps) {



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
                userLocation={userData.location}
            />
            <ProductComponentUser
                storeId={storeData.id}
                productData={storeData.products}
            />

        </div>
    );
}