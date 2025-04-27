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
    const t = useTranslations("app/(components)/cookie-consent");

    const [localPreferences, setLocalPreferences] = useState<CookiePreferences>({
        necessary: true,
        analytics: true,
        marketing: true,
    });
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, checked } = e.target;
        setLocalPreferences((prev) => ({
            ...prev,
            [name]: checked,
        }));
    };

    const handleAcceptSelected = async () => {
        setIsLoading(true);
        await savePreferences(localPreferences);
    };

    const handleRejectAll = async () => {
        setIsLoading(true);
        await rejectAll();
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
                "pointer-events-auto ml-auto max-w-sm rounded-large border border-divider bg-background/80 dark:bg-black/80 p-6 shadow-small backdrop-blur-md",
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
        <div className={`pointer-events-auto ml-auto max-w-sm rounded-large border border-divider bg-background/80 dark:bg-black/80 p-6 shadow-small backdrop-blur-md`}>
            <h1 className="text-large font-semibold text-foreground">
                {t("yourPrivacy")}
            </h1>
            <p className="text-small font-normal text-foreground/80">
                {t("privacyDescription")}{" "}
                <Link href="/policies/privacy-policy" size="sm" underline="always">
                    {t("privacy")}
                </Link>{" "}
                {t("forMoreInfo")}
            </p>
            <Spacer y={4} />
            <div className="flex flex-col gap-y-2">
                <SwitchCell
                    defaultSelected={true}
                    classNames={{
                        base: "dark:bg-content1",
                        label: "text-small",
                    }}
                    description={t("essentialDescription")}
                    label={t("essential")}
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
                    description={t("marketingDescription")}
                    label={t("marketing")}
                    name="marketing"
                    onChange={handleCheckboxChange}
                />
                <SwitchCell
                    defaultSelected={true}
                    classNames={{
                        base: "dark:bg-content1",
                        label: "text-small",
                    }}
                    description={t("analyticsDescription")}
                    label={t("analytics")}
                    name="analytics"
                    onChange={handleCheckboxChange}
                />
            </div>
            <Spacer y={4} />
            <div className="flex justify-between gap-x-3">
                <Button
                    fullWidth
                    className={`bg-gradient-primary text-white text-md`}
                    radius="lg"
                    isLoading={isLoading}
                    isDisabled={isLoading}
                    onPress={handleAcceptSelected}
                >
                    {t("acceptSelected")}
                </Button>
                <Button 
                    fullWidth 
                    variant="bordered"
                    className="text-foreground border-foreground/20"
                    isLoading={isLoading}
                    isDisabled={isLoading}
                    onPress={handleRejectAll}>
                    {t("rejectAll")}
                </Button>
            </div>
        </div>
    );

    const cookiesAlertContent = (
        <AnimatedWrapper>
            <h1 className="text-large font-semibold text-foreground">
                {t("continueToTheBakerz")}
            </h1>
            <p className="text-small font-normal text-foreground/80">
                {t("cookiesExplanation")}
            </p>
            <p className="text-small font-normal text-foreground/80">
                {t("cookiesConsentText")}{" "}
                <Link className="text-primary" href="/policies/privacy-policy" size="sm" underline="hover">
                    {t("cookiePolicy")}
                </Link>
            </p>
            <div className="mt-4 space-y-2">
                <Button
                    fullWidth
                    className={`bg-gradient-primary text-white text-xl`}
                    radius="lg"
                    endContent={<Icon className="ml-2 inline-block h-6 w-6 text-white" icon="lucide:cookie"/>}
                    isLoading={isLoading}
                    isDisabled={isLoading}
                    onPress={acceptAll}
                >
                    {t("acceptAll")}
                </Button>
                <Button
                    fullWidth
                    className="border-foreground/20 font-medium text-foreground"
                    radius="lg"
                    variant="bordered"
                    isLoading={isLoading}
                    isDisabled={isLoading}
                    onPress={handleRejectAll}
                >
                    {t("rejectAll")}
                </Button>
                <Button
                    fullWidth
                    className="font-medium text-foreground/80"
                    radius="lg"
                    variant="light"
                    isLoading={isLoading}
                    isDisabled={isLoading}
                    onPress={() => setIsSettingsOpen(true)}
                >
                    {t("cookieSettings")}
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