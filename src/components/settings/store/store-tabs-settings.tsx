/**
 * @fileoverview Tabbed layout for the store settings page.
 *
 * Exports the StoreTabsSettings client component, which shows the StoreInfo
 * summary card and tabs for store details (StoreSetting), pickup hours
 * (WorkingHoursManager), and delivery configuration (DeliveryManager). The
 * active tab is synced with the "tab" query parameter, save handlers are
 * cleared on tab change, and unauthenticated visitors are redirected to the
 * auth page.
 */
'use client';
import React from "react";
import { Tab, Tabs } from "@heroui/react";
import WorkingHoursManager from "@/components/settings/calendar-settings";
import {useTranslations} from "next-intl";
import {useSession} from "@/components/providers/session-provider";
import {redirect, useRouter, useSearchParams} from "next/navigation";
import DeliveryManager from "@/components/settings/delivery-settings";
import StoreSetting from "@/components/settings/store/store-settings";
import StoreInfo from "@/components/settings/store/store-info";

interface TabsSettingsProps {

}

export const StoreTabsSettings: React.FC<TabsSettingsProps> = ({

                                                          }) => {

    const t = useTranslations("app/(return_page)/settings/components/store-tabs-settings");
    const { session, clearSaveHandlers } = useSession();
    const searchParams = useSearchParams();
    const router = useRouter();

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
                onSelectionChange={(value) => {
                    // Update URL with the selected tab
                    router.push(`?tab=${value}`);
                    clearSaveHandlers();
                }}  
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