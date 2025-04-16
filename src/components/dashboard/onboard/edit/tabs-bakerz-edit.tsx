'use client';
import React from "react";
import { Tab, Tabs} from "@heroui/react";
import {useTranslations} from "next-intl";
import {useSession} from "@/components/providers/session-provider";
import {redirect, useSearchParams} from "next/navigation";
import DeliveryManager from "@/components/settings/delivery-settings";
import StoreInfo from "@/components/settings/store/store-info";
import EditBakerzForm from "../edit-bakerz-form";
import { StoreData } from "@/lib/actions/store";
import { StoreBusinessData } from "@/lib/actions/store";

interface TabsSettingsProps {
    store: StoreData | null;
    businessData: StoreBusinessData | null;

}

export const BakerzEditTabs: React.FC<TabsSettingsProps> = ({

    store,
    businessData    
                                                           }) => {

    const t = useTranslations("app/(return_page)/settings/components/store-tabs-settings");
    const { session } = useSession();
    const searchParams = useSearchParams();

    if (!session) {
        redirect('/auth?next=' + window.location.pathname);
    }

    // Read the "tab" query parameter; default to "profile" if not provided.
    const tabParam = searchParams.get('tab');
    const selectedTab = tabParam ? tabParam : "profile";


    return (
        <>
            <div className="container mx-auto p-6 max-w-6xl">
                <h1 className="text-2xl font-bold mb-6">Edit Bakerz</h1>
                
                <Tabs
                    defaultSelectedKey="bakerz"
                    fullWidth
                    classNames={{
                        base: "mt-6",
                        cursor: "bg-content1 dark:bg-content1 bg-gradient-card",
                        panel: "w-full p-0 pt-4",
                    }}
                >
                    <Tab key="bakerz" title="Bakerz Information">
                        <div className="flex flex-col items-center">
                            <EditBakerzForm 
                                store={store} 
                                businessData={businessData} 
                                className="max-w-2xl"
                            />
                        </div>
                    </Tab>
                    {store && (
                        <Tab key="delivery" title="Delivery Manager">
                            <DeliveryManager storeData={store} />
                        </Tab>
                    )}
                </Tabs>
            </div>
        </>
    );
};

export default BakerzEditTabs;