'use client';
import React, {Suspense} from "react";
import { Tab, Tabs } from "@heroui/react";
import { useSearchParams, useRouter } from 'next/navigation';
import { useSession } from "@/components/providers/session-provider";
import ProfileSetting from "@/components/settings/profile-setting";
import NotFound from "@/app/(error_layout)/not-found";
import WorkingHoursManager from "@/components/settings/calendar-settings";
import ProductTableSkeleton from "@/components/skeleton/product-table";
import ProductManager from "@/components/settings/products-settings";
import {ProductDialogProvider} from "@/components/providers/product-provider";

export default function Page() {
    const { session } = useSession();
    const searchParams = useSearchParams();

    if (!session) {
        return NotFound();
    }

    // Read the "tab" query parameter; default to "profile" if not provided.
    const tabParam = searchParams.get('tab');
    const selectedTab = tabParam ? tabParam : "profile";

    return (
        <div className="flex flex-col min-h-screen relative items-center container mx-auto justify-center">
            <div className="w-full max-w-2xl justify-center flex-1 py-4">
                {/* Title */}
                <div className="flex items-center gap-x-3">
                    <h1 className="text-3xl font-bold leading-9 text-default-foreground">Settings</h1>
                </div>
                <h2 className="mt-2 text-small text-default-500">
                    Customize your settings and profile.
                </h2>
                {/* Tabs */}
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
                    <Tab key="profile" title={`Profile ${session.store ? ' & Store View' : ""}`}>
                        <ProfileSetting />
                    </Tab>
                    {session.store && (
                        <>
                            <Tab key="calendar" title="Work Hours">
                                <WorkingHoursManager/>
                            </Tab>
                        </>

                    )}
                </Tabs>
            </div>
        </div>
    );
}
