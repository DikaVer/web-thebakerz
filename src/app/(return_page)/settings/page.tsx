import React from "react";
import { metadataDefault } from "@/components/metadata";
import type { Metadata } from "next";
import {getTranslations} from "next-intl/server";
import TabsSettings from "@/components/settings/tabs-settings";

export const metadata: Metadata = {
    ...metadataDefault,
    title: "Settings",
    description: "Manage your account settings and preferences for your TheBakerz profile and store."
};

export default async function Page() {
    const t = await getTranslations("Settings");

    return (
        <div className="flex flex-col min-h-screen relative items-center container mx-auto justify-center">
            <div className="w-full max-w-2xl justify-center flex-1 py-4">
                {/* Title */}
                <div className="flex items-center gap-x-3">
                    <h1 className="text-3xl font-bold leading-9 text-default-foreground">{t("SettingsTitle")}</h1>
                </div>
                <h2 className="mt-2 text-small text-default-500">
                    {t("SettingsDescription")}
                </h2>
                {/* Tabs */}
                <TabsSettings/>
            </div>
        </div>
    );
}