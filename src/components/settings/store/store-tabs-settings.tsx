'use client';
import React from "react";
import { Tab, Tabs } from "@heroui/react";
import WorkingHoursManager from "@/components/settings/calendar-settings";
import {useTranslations} from "next-intl";
import {useSession} from "@/components/providers/session-provider";
import {redirect, useSearchParams} from "next/navigation";
import DeliveryManager from "@/components/settings/delivery-settings";
import {useStore} from "@/components/providers/store-provider";
import StoreSetting from "@/components/settings/store/store-settings";
import StoreInfo from "@/components/settings/store/store-info";

interface TabsSettingsProps {

}

export const StoreTabsSettings: React.FC<TabsSettingsProps> = ({

                                                          }) => {

    const t = useTranslations("app/(return_page)/settings/components/store-tabs-settings");
    const { session } = useSession();
    const { store } = useStore();
    const searchParams = useSearchParams();

    if (!session) {
        redirect('/auth?next=' + window.location.pathname);
    }

    // Read the "tab" query parameter; default to "profile" if not provided.
    const tabParam = searchParams.get('tab');
    const selectedTab = tabParam ? tabParam : "profile";


    return (
        <>
            <StoreInfo className="mt-4" />
            
            <Tabs
                defaultSelectedKey={selectedTab}
                // onValueChange will update the URL query parameter to reflect the selected tab.
                //@ts-ignore
                fullWidth
                classNames={{
                    base: "mt-6",
                    cursor: "bg-content1 dark:bg-content1 bg-gradient-card",
                    panel: "w-full p-0 pt-4",
                }}
            >
                <Tab key="store" title={`${t("store")}`}>
                    <StoreSetting/>
                </Tab>
                <Tab key="pickup" title={t("pickup")}>
                    <WorkingHoursManager/>
                </Tab>
                <Tab key="delivery" title={t("delivery")}>
                    <DeliveryManager/>
                </Tab>
            </Tabs>
        </>
    );
};

export default StoreTabsSettings;