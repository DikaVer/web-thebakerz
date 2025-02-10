'use client';
import {Tab, Tabs} from "@heroui/react";
import TeamSetting from "@/components/settings/team-setting";
import React from "react";
import {useSession} from "@/components/providers/session-provider";
import ProfileSetting from "@/components/settings/profile-setting";
import NotFound from "@/app/(error_layout)/not-found";

export default function Page() {


    const { session } = useSession();

    if (!session) {
        return NotFound();
    }

    return (
        <div className={'flex flex-col min-h-screen relative items-center container mx-auto justify-center'}>
            <div className="w-full max-w-2xl justify-center flex-1 p-4">
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
                        title={`Profile ${session.store ? ' & Store View' : ""}`}
                    >
                        <ProfileSetting/>
                    </Tab>
                    {session.store &&
                        <Tab key="appearance" title="Products">
                            <TeamSetting/>
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
        </div>
    );
}