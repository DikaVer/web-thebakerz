/**
 * @fileoverview Cookie consent banner with per-category preference settings.
 *
 * Exports CookieConsentComponent, a fixed bottom banner that lets visitors
 * accept all, reject all, or toggle necessary/analytics/marketing cookie
 * categories. Persists choices through server actions and applies them by
 * configuring Google Analytics (gtag) and Microsoft Clarity consent,
 * identification, and role tagging.
 */
"use client";

import React, { useEffect, useState} from "react";
import {Button, cn, Link, ResizablePanel, Spacer} from "@heroui/react";
import {LazyMotion, domAnimation, AnimatePresence, m} from "framer-motion";
import SwitchCell from "@/components/ui/switch-cell";
import {usePathname} from "next/navigation";
import {acceptAll, CookiePreferences, getSessionCookieOrCreateClient, rejectAll, savePreferences} from "@/lib/actions/cookies/cookie";
import { useTranslations } from "next-intl";
import { GA_MEASUREMENT_ID } from "../google-analytics";
import clarity from "@microsoft/clarity";
import { logger } from "@/lib/logger";

// Add type declaration for gtag
declare global {
    interface Window {
      gtag: (
        command: string,
        target: string,
        params?: Record<string, any>
      ) => void;
      dataLayer: any[];
    }
  }
  
export default function CookieConsentComponent({id, isConsent, preferences, role}: {id?: string, isConsent?: boolean, preferences?: CookiePreferences | null, role?: string}) {
    const t = useTranslations("app/(components)/cookie-consent");
    const pathname = usePathname();
    const isSocials = pathname.includes('socials');

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

    const handleAcceptAll = async () => {
        setIsLoading(true);
        await acceptAll();
        await setTrackingCookie(id, role);
        
    };

    const handleAcceptSelected = async () => {
        setIsLoading(true);
        await savePreferences(localPreferences);
        if(localPreferences.analytics) {
            await setTrackingCookie(id, role);
        } else {
            clarity.consent(false);
        }
    };

    const handleRejectAll = async () => {
        setIsLoading(true);
        await rejectAll();
        !id && await getSessionCookieOrCreateClient()
        clarity.consent(false);
    };

    const initCookieConsent = async () => {
        logger.debug('cookie-consent', 'initCookieConsent', {
            preferences
        });

        if(!preferences) {
            await setTrackingCookie(id, role);
            return;
        }

        if(preferences?.analytics) {
            await setTrackingCookie(id, role);
        } else {
            clarity.consent(false);
        }
    }

    useEffect(() => {
        initCookieConsent();
    }, []);


    const AnimatedWrapper = ({
                                 children,
                                 className,
                                 ...props
                             }: React.PropsWithChildren<{className?: string}>) => (
        <m.div
            className={cn(
                "pointer-events-auto ml-auto max-w-xl rounded-large border border-divider bg-background/80 dark:bg-black/80 p-4 shadow-small backdrop-blur-md",
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
        <div className={`pointer-events-auto ml-auto max-w-xl rounded-large border border-divider bg-background/80 dark:bg-black/80 p-4 shadow-small backdrop-blur-md`}>
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
            <div className="flex flex-row justify-between gap-x-3">
                <Button
                    aria-label="Accept selected"
                    fullWidth
                    className={`bg-gradient-primary text-white`}
                    size="sm"
                    isLoading={isLoading}
                    isDisabled={isLoading}
                    onPress={handleAcceptSelected}
                >
                    {t("acceptSelected")}
                </Button>
                <Button 
                    aria-label="Reject all"
                    fullWidth 
                    variant="bordered"
                    className="text-foreground border-foreground/20"
                    size="sm"
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
                {t("cookiesExplanation")}{" "}
                <Link className="text-primary" href="/policies/privacy-policy" size="sm" underline="hover">
                    {t("cookiePolicy")}
                </Link>
            </p>
            <div className="flex flex-row gap-x-1 mt-4">
                <Button
                    aria-label="Accept all"
                    fullWidth
                    className={`bg-gradient-primary text-white text-xs px-1`}
                    radius="lg"
                    size="sm"
                    isLoading={isLoading}
                    isDisabled={isLoading}
                    onPress={handleAcceptAll}
                >
                    {t("acceptAll")}
                </Button>
                <Button
                    aria-label="Accept essential"
                    fullWidth
                    className="border-foreground/20 font-medium text-foreground"
                    radius="lg"
                    size="sm"
                    variant="bordered"
                    isLoading={isLoading}
                    isDisabled={isLoading}
                    onPress={handleRejectAll}
                >
                    {t("acceptEssential")}
                </Button>
                <Button
                    aria-label="Cookie settings"
                    fullWidth
                    className="font-medium text-foreground/80 w-fit"
                    radius="lg"
                    size="sm"
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
        isSocials || isConsent || isLoading ? null :
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


const setTrackingCookie = async (id?: string,  role?: string) => {
    const userId = id || await getSessionCookieOrCreateClient()
    logger.debug('cookie-consent-initCookieConsent', 'initCookieConsent', {
        userId
    });
    window.gtag("config", GA_MEASUREMENT_ID, {
        user_id: userId
    });
    clarity.identify(userId);
    if(role === "admin") {
        clarity.setTag("role", "admin");
    } else if (role === "bakerz") {
        clarity.setTag("role", "bakerz");
    } else if (role === "user") {
        clarity.setTag("role", "user");
    } else {
        clarity.setTag("role", "guest");
    }
}
