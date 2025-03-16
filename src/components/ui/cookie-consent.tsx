"use client";

import React, {useEffect, useState} from "react";
import {Button, cn, Link, ResizablePanel, Spacer} from "@heroui/react";
import {LazyMotion, domAnimation, AnimatePresence, m} from "framer-motion";
import {Icon} from "@iconify/react";
import { useTransition } from "react";
import SwitchCell from "@/components/ui/switch-cell";
import {useRouter} from "next/navigation";
import {acceptAll, CookiePreferences, rejectAll, savePreferences} from "@/lib/cookie";
import { useTranslations } from "next-intl";

export default function CookieConsentComponent() {
    const t = useTranslations("TheBakerz");

    const [localPreferences, setLocalPreferences] = useState<CookiePreferences>({
        necessary: true,
        analytics: true,
        marketing: true,
    });
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);

    const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, checked } = e.target;
        setLocalPreferences((prev) => ({
            ...prev,
            [name]: checked,
        }));
    };

    const handleAcceptSelected = async () => {
        await savePreferences(localPreferences);
        setIsLoading(true);
    };

    const handleRejectAll = async () => {
        await rejectAll();
        setIsLoading(false);
    };

    if (isLoading) {
        return null;
    }

    const AnimatedWrapper = ({
                                 children,
                                 className,
                                 ...props
                             }: React.PropsWithChildren<{className?: string}>) => (
        <m.div
            className={cn(
                "pointer-events-auto ml-auto max-w-sm rounded-large border border-divider bg-background/15 p-6 shadow-small backdrop-blur",
                className,
            )}
            exit="hidden"
            initial="hidden"
            transition={{
                opacity: {
                    duration: 0.5,
                },
            }}
            {...props}
        >
            {children}
        </m.div>
    );

    const cookieSettingsContent = (
        <div className={`pointer-events-auto ml-auto max-w-sm rounded-large border border-divider bg-background/15 p-6 shadow-small backdrop-blur`}>
            <h1 className="text-large font-semibold">{t("YourPrivacy")}</h1>
            <p className="text-small font-normal text-default-700">
                {t("PrivacyDescription")}{" "}
                <Link href="/policies/privacy-policy" size="sm" underline="always">
                    {t("Privacy")}
                </Link>{" "}
                {t("ForMoreInfo")}
            </p>
            <Spacer y={4} />
            <div className="flex flex-col gap-y-2">
                <SwitchCell
                    defaultSelected={true}
                    classNames={{
                        base: "dark:bg-content1",
                        label: "text-small",
                    }}
                    description={t("EssentialDescription")}
                    label={t("Essential")}
                    name="necessary"
                    onChange={handleCheckboxChange}
                    isDisabled
                />
                <SwitchCell
                    defaultSelected={true}
                    classNames={{
                        base: "dark:bg-content1",
                        label: "text-small",
                    }}
                    description={t("MarketingDescription")}
                    label={t("Marketing")}
                    name="marketing"
                    onChange={handleCheckboxChange}
                />
                <SwitchCell
                    defaultSelected={true}
                    classNames={{
                        base: "dark:bg-content1",
                        label: "text-small",
                    }}
                    description={t("AnalyticsDescription")}
                    label={t("Analytics")}
                    name="analytics"
                    onChange={handleCheckboxChange}
                />
            </div>
            <Spacer y={4} />
            <div className="flex justify-between gap-x-3">
                <Button
                    fullWidth
                    className={`bg-gradient-primary text-default-200 text-md`}
                    radius="lg"
                    isLoading={isLoading}
                    isDisabled={isLoading}
                    onPress={handleAcceptSelected}
                >
                    {t("AcceptSelected")}
                </Button>
                <Button fullWidth variant="bordered"
                        isLoading={isLoading}
                        isDisabled={isLoading}
                        onPress={handleRejectAll}>
                    {t("RejectAll")}
                </Button>
            </div>
        </div>
    );

    const cookiesAlertContent = (
        <AnimatedWrapper>
            <h1 className="text-large font-semibold">{t("ContinueToTheBakerz")}</h1>
            <p className="text-small font-normal text-default-700">
                {t("CookiesExplanation")}
            </p>
            <p className="text-small font-normal text-default-700">
                {t("CookiesConsentText")}{" "}
                <Link href="/policies/privacy-policy" size="sm" underline="hover">
                    {t("CookiePolicy")}
                </Link>
            </p>
            <div className="mt-4 space-y-2">
                <Button
                    fullWidth
                    className={`bg-gradient-primary text-default-200 text-xl`}
                    radius="lg"
                    endContent={<Icon className="ml-2 inline-block h-6 w-6 text-default-200" icon="lucide:cookie"/>}
                    isLoading={isLoading}
                    isDisabled={isLoading}
                    onPress={acceptAll}
                >
                    {t("AcceptAll")}
                </Button>
                <Button
                    fullWidth
                    className="border-default-200 font-medium text-default-foreground"
                    radius="lg"
                    variant="bordered"
                    isLoading={isLoading}
                    isDisabled={isLoading}
                    onPress={handleRejectAll}
                >
                    {t("RejectAll")}
                </Button>
                <Button
                    fullWidth
                    className="font-medium text-default-foreground"
                    radius="lg"
                    variant="light"
                    isLoading={isLoading}
                    isDisabled={isLoading}
                    onPress={() => setIsSettingsOpen(true)}
                >
                    {t("CookieSettings")}
                </Button>
            </div>
        </AnimatedWrapper>
    );

    return (
        <div className="pointer-events-none fixed inset-x-0 bottom-0 px-6 pb-6 z-50">
            <ResizablePanel>
                <AnimatePresence initial={false} mode="wait">
                    <LazyMotion features={domAnimation}>
                        {isSettingsOpen ? cookieSettingsContent : cookiesAlertContent}
                    </LazyMotion>
                </AnimatePresence>
            </ResizablePanel>
        </div>
    );
}