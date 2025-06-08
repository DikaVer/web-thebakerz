import React from "react";
import { getLocalizedMetadata } from "@/components/metadata";
import type { Metadata } from "next";
import {getTranslations} from "next-intl/server";
import TabsSettings from "@/components/settings/tabs-settings";
import { getCurrentBusinessUser } from "@/lib/api/user-api";

const pageTitle = "Account Settings | TheBakerz";
const pageDescription = "Manage your TheBakerz account settings, profile information, and preferences. Update your details here.";
const pageUrl = "https://www.thebakerz.com/settings";

export const metadata: Metadata = {
    ...(getLocalizedMetadata('en')),
    title: pageTitle,
    description: pageDescription,
    robots: {
        index: false,
        follow: false, 
    },
    alternates: {
        canonical: pageUrl,
    },
    openGraph: {
        ...(getLocalizedMetadata('en').openGraph || {}),
        title: pageTitle,
        description: pageDescription,
        url: pageUrl,
        type: 'profile',
    },
    twitter: {
        ...(getLocalizedMetadata('en').twitter || {}),
        card: 'summary',
        title: pageTitle,
        description: pageDescription,
    }
};

export default async function Page() {
    const t = await getTranslations("app/(return_page)/settings/page");
    const businessData = await getCurrentBusinessUser();

    return (
        <div className="flex flex-col min-h-screen relative items-center container mx-auto justify-center">
            <div className="w-full max-w-2xl justify-center flex-1 py-4">
                {/* Title */}
                <div className="flex items-center gap-x-3">
                    <h1 className="text-3xl font-bold leading-9 text-foreground">{t("settingsTitle")}</h1>
                </div>
                <h2 className="mt-2 text-small text-default-500">
                    {t("settingsDescription")}
                </h2>
                {/* Tabs */}
                <TabsSettings
                    business={businessData}
                />
            </div>
        </div>
    );
}