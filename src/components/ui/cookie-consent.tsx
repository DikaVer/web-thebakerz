"use client";

import React, {useEffect, useState} from "react";
import {Button, cn, Link, ResizablePanel, Spacer} from "@heroui/react";
import {LazyMotion, domAnimation, AnimatePresence, m} from "framer-motion";
import {Icon} from "@iconify/react";
import { useTransition } from "react";
import SwitchCell from "@/components/ui/switch-cell";
import {useRouter} from "next/navigation";
import {acceptAll, CookiePreferences, rejectAll, savePreferences} from "@/lib/cookie";
export default function CookieConsentComponent() {


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
            <h1 className="text-large font-semibold">Your Privacy</h1>
            <p className="text-small font-normal text-default-700">
                This site uses tracking technologies to improve your experience. You may choose to accept or
                reject these technologies. If you choose to &nbsp;<span className="font-semibold">&quot;Reject All&quot;</span>, we
                will use cookies for only essential purposes. Check our{" "}
                <Link href="/policies/privacy-policy" size="sm" underline="always">
                    Privacy
                </Link>{" "}
                for more information.
            </p>
            <Spacer y={4} />
            <div className="flex flex-col gap-y-2">
                <SwitchCell
                    defaultSelected={true}
                    classNames={{
                        base: "dark:bg-content1",
                        label: "text-small",
                    }}
                    description="Essential for the site to function"
                    label="Essential"
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
                    description="To show you relevant content"
                    label="Marketing"
                    name="marketing"
                    onChange={handleCheckboxChange}
                />
                <SwitchCell
                    defaultSelected={true}
                    classNames={{
                        base: "dark:bg-content1",
                        label: "text-small",
                    }}
                    description="To understand how you use the site"
                    label="Analytics"
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
                    Accept Selected
                </Button>
                <Button fullWidth variant="bordered"
                        isLoading={isLoading}
                        isDisabled={isLoading}
                        onPress={handleRejectAll}>
                    Reject All
                </Button>
            </div>
        </div>
    );

    const cookiesAlertContent = (
        <AnimatedWrapper>
            <h1 className="text-large font-semibold">Before you continue to TheBakerz</h1>
            <p className="text-small font-normal text-default-700">
                We use cookies on our website to give you the most relevant experience by remembering your
                preferences and repeat visits.

            </p>
            <p className="text-small font-normal text-default-700">
                By clicking&nbsp;
                <b className="font-semibold">&quot;Accept All&quot;</b>, you consent to the use of ALL the
                cookies. If you choose to &nbsp;<span className="font-semibold">&quot;Reject All&quot;</span>, we
                will use cookies for only essential purposes. However, you may visit&nbsp;
                <span className="font-semibold">&quot;Cookie Settings&quot;</span> to provide a controlled
                consent. For more information, please read our{" "}
                <Link href="/policies/privacy-policy" size="sm" underline="hover">
                    Cookie Policy.
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
                    Accept All
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
                    Reject All
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
                    Cookie Settings
                </Button>
            </div>
        </AnimatedWrapper>
    );


    return (
        <div className="pointer-events-none fixed inset-x-0 bottom-0 px-6 pb-6 z-50">
            <ResizablePanel
            >
                <AnimatePresence initial={false} mode="wait">
                    <LazyMotion features={domAnimation}>
                        {isSettingsOpen ? cookieSettingsContent : cookiesAlertContent}
                    </LazyMotion>
                </AnimatePresence>
            </ResizablePanel>
        </div>
    );
}
