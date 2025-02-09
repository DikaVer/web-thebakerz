'use client';

import React from 'react';
import {Tabs, Tab} from '@heroui/react';
import ProfileSetting from './profile-setting';
import {ProfileData} from "@/lib/actions/user";
import AppearanceSetting from "@/components/settings/appearance-setting";
import TeamSetting from "@/components/settings/team-setting";


export default function SettingsComponent({profileData} : {profileData: ProfileData}) {

    return (
        <div className="w-full max-w-2xl flex-1 p-4">
            {/* Title */}
            <div className="flex items-center gap-x-3">
                <h1 className="text-3xl font-bold leading-9 text-default-foreground">Settings</h1>
            </div>
            <h2 className="mt-2 text-small text-default-500">
                Customize settings, email preferences, and web appearance.
            </h2>
            {/* Tabs */}
            <Tabs
                fullWidth
                classNames={{
                    base: "mt-6",
                    cursor: "bg-content1 dark:bg-content1 bg-gradient-card",
                    panel: "w-full p-0 pt-4",
                }}
            >
                <Tab
                    key="profile"
                    title={`Profile ${profileData.storeData && ' & Store View'}`}
                >
                    <ProfileSetting
                        picture={profileData.picture}
                        name={profileData.name}
                        email={profileData.email}
                        location={profileData.location}

                        storeName={profileData?.storeData?.storeName}
                        description={profileData?.storeData?.description}
                        phone={profileData?.storeData?.phone}
                        store_loc={profileData?.storeData?.location}

                        role={profileData.role}
                    />
                </Tab>
                {profileData.storeData &&

                <Tab key="appearance" title="Products">
                    <TeamSetting />
                </Tab>
                }
                {/*<Tab key="account" title="Account">*/}
                {/*    <AccountSetting />*/}
                {/*</Tab>*/}
                {/*<Tab key="billing" title="Billing">*/}
                {/*    <BillingSetting />*/}
                {/*</Tab>*/}
                {/*<Tab key="team" title="Team">*/}
                {/*    <TeamSetting />*/}
                {/*</Tab>*/}
            </Tabs>
        </div>
    );
};
