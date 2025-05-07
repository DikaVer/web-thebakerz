'use client';
import React, { useState, useEffect } from "react";
import { Tab, Tabs } from "@heroui/react";
import ProfileSetting from "@/components/settings/profile-setting";
import {useTranslations} from "next-intl";
import {useSession} from "@/components/providers/session-provider";
import {redirect, useSearchParams} from "next/navigation";
import { getCurrentBusinessUser } from "@/lib/actions/user";
import StoreSetting from "./store/store-settings";
import BusinessInfo from "./business-info";


interface TabsSettingsProps {

}

export const TabsSettings: React.FC<TabsSettingsProps> = ({

}) => {

    const t = useTranslations("app/(return_page)/settings/components/tabs-settings");
    const { session } = useSession();
    const searchParams = useSearchParams();
    const [userBusiness, setUserBusiness] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (session.user) {
            const fetchBusinessUser = async () => {
                try {
                    const business = await getCurrentBusinessUser(session.user.id);
                    setUserBusiness(business);
                } catch (error) {
                    console.error("Error fetching business data:", error);
                } finally {
                    setLoading(false);
                }
            };
            
            fetchBusinessUser();
        }
    }, [session.user]);

    if (!session.user) {
        redirect('/auth?next=' + window.location.pathname);
    }

    // Read the "tab" query parameter; default to "profile" if not provided.
    const tabParam = searchParams.get('tab');
    const selectedTab = tabParam ? tabParam : "profile";

    if (loading) {
        return <div className="mt-6 p-4">Loading...</div>;
    }

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
              <BusinessInfo />
          </Tab>
        
        </Tabs>
    );
};

export default TabsSettings;