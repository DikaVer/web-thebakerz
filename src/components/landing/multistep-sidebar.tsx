"use client";

import React from "react";
import { cn } from "@heroui/react";
import { useTranslations } from "next-intl";

import SupportCard from "./support-card";
import VerticalSteps from "./vertical-steps";
import RowSteps from "./row-steps";

export type MultiStepSidebarProps = React.HTMLAttributes<HTMLDivElement> & {
    currentPage: number;
    onNext: () => void;
};

const stepperClasses = cn(
    // light
    "[--step-color:hsl(var(--primary))]",
    "[--active-color:hsl(var(--primary))]",
    "[--inactive-border-color:hsl(var(--primary))]",
    "[--inactive-bar-color:hsl(var(--primary))]",
    "[--inactive-color:hsl(var(--primary))]",
    // dark
    "dark:[--step-color:hsl(var(--secondary))]",
    "dark:[--active-color:hsl(var(--secondary))]",
    "dark:[--inactive-border-color:hsl(var(--secondary))]",
    "dark:[--inactive-bar-color:hsl(var(--secondary))]",
    "dark:[--inactive-color:hsl(var(--secondary))]",
    "dark:[--step-fg-color:hsl(var(--border))]"
);

const MultiStepSidebar = React.forwardRef<HTMLDivElement, MultiStepSidebarProps>(
    ({ children, className, currentPage, onNext, ...props }, ref) => {
        const t = useTranslations("MultiStepSidebar");

        const verticalSteps = [
            {
                title: t("applyTitle", { default: "Apply" }),
                description: t("applyDescription", {
                    default:
                        "Fill out a quick form, and we’ll get in touch to explain everything and set up your account."
                })
            },
            {
                title: t("setUpStoreTitle", { default: "We Set Up Your Store" }),
                description: t("setUpStoreDescription", {
                    default:
                        "Share your products and prices, and we’ll handle the setup for you."
                })
            },
            {
                title: t("startSellingTitle", { default: "Start Selling" }),
                description: t("startSellingDescription", {
                    default:
                        "Test your store, make adjustments, and start taking real orders!"
                })
            }
        ];

        const rowSteps = [
            {
                title: t("applyTitle", { default: "Apply" })
            },
            {
                title: t("setUpStoreTitle", { default: "Set Up Store" })
            },
            {
                title: t("startSellingTitle", { default: "Start Selling" })
            }
        ];

        return (
            <div ref={ref} className={cn("flex h-fit mb-24 w-full gap-x-2", className)} {...props}>
                <div className="flex hidden w-full max-w-[344px] flex-shrink-0 flex-col items-start gap-y-8 rounded-large bg-gradient-card from-default-100 via-danger-100 to-secondary-100 px-8 py-6 shadow-small lg:flex">
                    <VerticalSteps
                        className={stepperClasses}
                        color="secondary"
                        currentStep={currentPage}
                        steps={verticalSteps}
                    />
                    <SupportCard className="w-full backdrop-blur-lg lg:bg-white/40 lg:shadow-none dark:lg:bg-white/20" />
                </div>
                <div className="flex w-full flex-col items-center gap-4 md:p-4">
                    <div className="top-0 z-10 w-full rounded-large bg-gradient-card py-4 max-w-[85vw] shadow-small md:max-w-xl lg:hidden">
                        <div className="flex justify-center">
                            {/* Mobile Steps */}
                            <RowSteps className={cn("pl-6 w-full", stepperClasses)} currentStep={currentPage} steps={rowSteps} />
                        </div>
                    </div>
                    <div className="h-full w-full p-4sm:max-w-md md:max-w-lg">
                        {children}
                        <SupportCard className="mx-auto w-full max-w-[252px] lg:hidden mt-12" />
                    </div>
                </div>
            </div>
        );
    }
);

MultiStepSidebar.displayName = "MultiStepSidebar";

export default MultiStepSidebar;