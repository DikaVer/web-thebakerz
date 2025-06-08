'use client';
import React, { useState, useEffect } from "react";
import { Tab, Tabs } from "@heroui/react";
import ProfileSetting from "@/components/settings/profile-setting";
import {useTranslations} from "next-intl";
import {useSession} from "@/components/providers/session-provider";
import {redirect, useSearchParams} from "next/navigation";
import BusinessInfo from "./business-info";
import { StoreBusinessData } from "@/lib/actions/store";


interface TabsSettingsProps {
    business: StoreBusinessData | null;
}

export const TabsSettings: React.FC<TabsSettingsProps> = ({
    business
}) => {

    const t = useTranslations("app/(return_page)/settings/components/tabs-settings");
    const { session } = useSession();
    const searchParams = useSearchParams();

    if (!session.user) {
        redirect('/auth?next=' + window.location.pathname);
    }

    // Read the "tab" query parameter; default to "profile" if not provided.
    const tabParam = searchParams.get('tab');
    const selectedTab = tabParam ? tabParam : "profile";


    return (
        <Tabs
          defaultSelectedKey={selectedTab}
          // onValueChange will update the URL query parameter to reflect the selected tab.
          //@ts-ignore
          fullWidth
          classNames={{
              base: "mt-6",
              tabList: "bg-white",
              cursor: " bg-gradient-card",
              panel: "w-full p-0 pt-4",
          }}
        >
          <Tab key="profile" title={`${t("profile")}`}>
              <ProfileSetting />
          </Tab>
          <Tab key="info" title={`${t("information")}`}>
              <BusinessInfo business={business} />
          </Tab>
        
        </Tabs>
    );
};

export default TabsSettings;