'use client';
import React from "react";
import { Tab, Tabs } from "@heroui/react";
import ProfileSetting from "@/components/settings/profile-setting";
import WorkingHoursManager from "@/components/settings/calendar-settings";
import {useTranslations} from "next-intl";
import {useSession} from "@/components/providers/session-provider";
import {redirect, useSearchParams} from "next/navigation";


interface TabsSettingsProps {

}

export const TabsSettings: React.FC<TabsSettingsProps> = ({

}) => {

    const t = useTranslations("app/(return_page)/settings/components/tabs-settings");
    const { session } = useSession();
    const searchParams = useSearchParams();

    if (!session) {
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
              cursor: "bg-content1 dark:bg-content1 bg-gradient-card",
              panel: "w-full p-0 pt-4",
          }}
        >
          <Tab key="profile" title={`${t("profile")} ${session?.store ? t("profileAndStoreTab") : ""}`}>
              <ProfileSetting />
          </Tab>
          {session?.store  && (
              <>
                  <Tab key="calendar" title={t("workingHoursTab")}>
                      <WorkingHoursManager/>
                  </Tab>
              </>
          )}
        </Tabs>
    );
};

export default TabsSettings;