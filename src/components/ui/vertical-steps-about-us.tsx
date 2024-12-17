"use client";

import {ComponentProps, useState} from "react";
import type {ButtonProps} from "@nextui-org/react";

import React from "react";

import {useControlledState} from "@react-stately/utils";

import {m, LazyMotion, domAnimation} from "framer-motion";
import {cn} from "@nextui-org/react";
import {useRouter} from "next/navigation";

export type RowStepProps = {
    title?: React.ReactNode;
    description?: React.ReactNode;
    className?: string;
};

export interface RowStepsProps extends React.HTMLAttributes<HTMLButtonElement> {
    /**
     * An array of steps.
     *
     * @default []
     */
    steps?: RowStepProps[];
    /**
     * The color of the steps.
     *
     * @default "primary"
     */
    color?: ButtonProps["color"];
    /**
     * The current step index.
     */
    currentStep?: number;
    /**
     * The default step index.
     *
     * @default 0
     */
    defaultStep?: number;
    /**
     * Whether to hide the progress bars.
     *
     * @default false
     */
    hideProgressBars?: boolean;
    /**
     * The custom class for the steps wrapper.
     */
    className?: string;
    /**
     * The custom class for the step.
     */
    stepClassName?: string;
    /**
     * Callback function when the step index changes.
     */
    onStepChange?: (stepIndex: number) => void;

    plusRange?: number;
}

function CheckIcon(props: ComponentProps<"svg">) {
    return (
        <svg {...props} fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <m.path
                animate={{pathLength: 1}}
                d="M5 13l4 4L19 7"
                initial={{pathLength: 0}}
                strokeLinecap="round"
                strokeLinejoin="round"
                transition={{
                    delay: 0.2,
                    type: "tween",
                    ease: "easeOut",
                    duration: 0.3,
                }}
            />
        </svg>
    );
}

export const VerticalStepsAboutUs = React.forwardRef<HTMLButtonElement, RowStepsProps>(
    (
        {
            color = "primary",
            steps = [],
            defaultStep = 0,
            onStepChange,
            currentStep: currentStepProp,
            hideProgressBars = false,
            stepClassName,
            className,
            plusRange = 0,
            ...props
        },
        ref,
    ) => {
        const [currentStep, setCurrentStep] = useControlledState(
            currentStepProp,
            defaultStep,
            onStepChange,
        );



        const colors = React.useMemo(() => {
            let userColor;
            let fgColor;

            const colorsVars = [
                "[--active-fg-color:var(--step-fg-color)]",
                "[--active-border-color:var(--step-color)]",
                "[--active-color:var(--step-color)]",
                "[--complete-background-color:var(--step-color)]",
                "[--complete-border-color:var(--step-color)]",
                "[--inactive-border-color:hsl(var(--primary))]",
                "[--inactive-color:hsl(var(--primary))]",
            ];


            userColor = "[--step-color:hsl(var(--secondary))]";
            fgColor = "[--step-fg-color:hsl(var(--secondary-foreground))]";


            if (!className?.includes("--step-fg-color")) colorsVars.unshift(fgColor);
            if (!className?.includes("--step-color")) colorsVars.unshift(userColor);
            if (!className?.includes("--inactive-bar-color"))
                colorsVars.push("[--inactive-bar-color:hsl(var(--nextui-default-300))]");

            return colorsVars;
        }, [color, className]);

        return (
            <nav aria-label="Progress" className="-my-4 max-w-2xl overflow-x-auto py-4">
                <ol className={cn("flex flex-col flex-nowrap gap-x-3", colors, className)}>
                    {steps?.map((step, stepIdx) => {
                        stepIdx += plusRange;
                        let status =
                            currentStep === stepIdx ? "active" : currentStep < stepIdx ? "inactive" : "complete";

                        return (
                            <li key={stepIdx} className="relative flex flex-col w-full items-center">
                                <button
                                    key={stepIdx}
                                    ref={ref}
                                    aria-current={status === "active" ? "step" : undefined}
                                    className={cn(
                                        "flex w-full cursor-pointer items-center justify-center rounded-large py-2.5",
                                        stepClassName,
                                    )}
                                    onClick={() => setCurrentStep(stepIdx)}
                                    {...props}
                                >
                                    <div className={"group flex w-full min-h-[280px] max-h-[280px] h-full cursor-pointer flex-row items-center justify-center gap-x-3 "}>
                                        <div className="h-ful relative flex items-center">
                                            <LazyMotion features={domAnimation}>
                                                <m.div animate={status} className="relative">
                                                    <m.div
                                                        className={cn(
                                                            "relative flex h-[80px] w-[80px] items-center justify-center rounded-full border-medium border-primary text-large font-semibold text-primary",
                                                            {
                                                                "shadow-lg": status === "complete",
                                                            },
                                                        )}
                                                        initial={false}
                                                        transition={{duration: 0.25}}
                                                        variants={{
                                                            inactive: {
                                                                backgroundColor: "transparent",
                                                                borderColor: "hsl(var(--text))",
                                                                color: "var(--inactive-color)",
                                                            },
                                                            active: {
                                                                backgroundColor: "hsl(var(--secondary))",
                                                                borderColor: "var(--active-border-color)",
                                                                color: "var(--active-color)",
                                                            },
                                                            complete: {
                                                                backgroundColor: "var(--complete-background-color)",
                                                                borderColor: "var(--complete-border-color)",
                                                            },
                                                        }}
                                                    >
                                                        <div className="flex items-center justify-center">
                                                            {status === "complete" ? (
                                                                <CheckIcon
                                                                    className="h-14 w-14 text-[hsl(var(--primary))]"/>
                                                            ) : (
                                                                <p className={`text-3xl text-primary`}>
                                                                    {stepIdx + 1}
                                                                </p>
                                                            )}
                                                        </div>
                                                    </m.div>
                                                </m.div>
                                            </LazyMotion>
                                        </div>
                                        <div className="max-w-full flex-1 text-start">
                                            <div
                                                className={cn(
                                                    "text-xl sm:text-2xl font-medium text-default-foreground transition-[color,opacity] duration-300 group-active:opacity-80",
                                                    {
                                                        "text-grayText": status === "inactive",
                                                        "animate-fadeInDown": status === "active",
                                                    },
                                                )}
                                            >
                                                {step.title}
                                            </div>
                                            <div
                                                className={cn(
                                                    "text-lg sm:text-xl text-grayText font-medium duration-300",
                                                    { "animate-fadeInDown": status === "active" }
                                                )}
                                            >
                                                {step.description}
                                            </div>
                                        </div>
                                    </div>
                                    {stepIdx < steps.length + plusRange - 1 && !hideProgressBars && (
                                        <div
                                            aria-hidden="true"
                                            className="pointer-events-none absolute translate-y-[150px] -left-8 w-36 flex-none items-center"
                                            style={{
                                                // @ts-ignore
                                                "--idx": stepIdx,
                                            }}
                                        >
                                            <div
                                                className={cn(
                                                    "relative h-1 w-full rotate-90 bg-[var(--inactive-bar-color)] transition-colors duration-300",
                                                    "after:absolute after:block after:h-full after:w-0 after:bg-[hsl(var(--primary))] after:transition-[width] after:duration-300 after:content-['']",
                                                    {
                                                        "after:w-full": stepIdx < currentStep,
                                                    },
                                                )}
                                            />
                                        </div>
                                    )}
                                </button>
                            </li>
                        );
                    })}
                </ol>
            </nav>
        );
    },
);

export const VerticalStepsForecast = React.forwardRef<HTMLButtonElement, RowStepsProps>(
    (
        {
            color = "primary",
            steps = [],
            defaultStep = 0,
            onStepChange,
            currentStep: currentStepProp,
            hideProgressBars = false,
            stepClassName,
            className,
            plusRange = 0,
            ...props
        },
        ref,
    ) => {
        const [currentStep, setCurrentStep] = useControlledState(
            currentStepProp,
            defaultStep,
            onStepChange,
        );


        const colors = React.useMemo(() => {
            let userColor;
            let fgColor;

            const colorsVars = [
                "[--active-fg-color:var(--step-fg-color)]",
                "[--active-border-color:var(--step-color)]",
                "[--active-color:var(--step-color)]",
                "[--complete-background-color:var(--step-color)]",
                "[--complete-border-color:var(--step-color)]",
                "[--inactive-border-color:hsl(var(--primary))]",
                "[--inactive-color:hsl(var(--primary))]",
            ];


            userColor = "[--step-color:hsl(var(--secondary))]";
            fgColor = "[--step-fg-color:hsl(var(--secondary-foreground))]";


            if (!className?.includes("--step-fg-color")) colorsVars.unshift(fgColor);
            if (!className?.includes("--step-color")) colorsVars.unshift(userColor);
            if (!className?.includes("--inactive-bar-color"))
                colorsVars.push("[--inactive-bar-color:hsl(var(--nextui-default-300))]");

            return colorsVars;
        }, [color, className]);

        return (
            <nav aria-label="Progress" className="-my-4 max-w-2xl overflow-x-auto py-4">
                <ol className={cn("flex flex-col flex-nowrap gap-x-3", colors, className)}>
                    {steps?.map((step, stepIdx) => {
                        stepIdx += plusRange;
                        let status =
                            currentStep === stepIdx ? "active" : currentStep < stepIdx ? "inactive" : "complete";

                        return (
                            <li key={stepIdx} className="relative flex flex-col w-full items-center">
                                <button
                                    key={stepIdx}
                                    ref={ref}
                                    aria-current={status === "active" ? "step" : undefined}
                                    className={cn(
                                        "flex w-full cursor-pointer items-center justify-center rounded-large py-2.5",
                                        stepClassName,
                                    )}
                                    onClick={() => setCurrentStep(stepIdx)}
                                    {...props}
                                >
                                    <div className={"group flex w-full min-h-[172px] max-h-[172px] h-full cursor-pointer flex-row items-center justify-center gap-x-3 "}>
                                        <div className="h-ful relative flex items-center">
                                            <LazyMotion features={domAnimation}>
                                                <m.div animate={status} className="relative">
                                                    <m.div
                                                        className={cn(
                                                            "relative flex h-[80px] w-[80px] items-center justify-center rounded-full border-medium border-primary text-large font-semibold text-primary",
                                                            {
                                                                "shadow-lg": status === "complete",
                                                            },
                                                        )}
                                                        initial={false}
                                                        transition={{duration: 0.25}}
                                                        variants={{
                                                            inactive: {
                                                                backgroundColor: "transparent",
                                                                borderColor: "hsl(var(--text))",
                                                                color: "var(--inactive-color)",
                                                            },
                                                            active: {
                                                                backgroundColor: "hsl(var(--secondary))",
                                                                borderColor: "var(--active-border-color)",
                                                                color: "var(--active-color)",
                                                            },
                                                            complete: {
                                                                backgroundColor: "var(--complete-background-color)",
                                                                borderColor: "var(--complete-border-color)",
                                                            },
                                                        }}
                                                    >
                                                        <div className="flex items-center justify-center">
                                                            {status === "complete" ? (
                                                                <CheckIcon
                                                                    className="h-14 w-14 text-[hsl(var(--primary))]"/>
                                                            ) : (
                                                                <p className={`text-3xl text-primary`}>
                                                                    {stepIdx + 1}
                                                                </p>
                                                            )}
                                                        </div>
                                                    </m.div>
                                                </m.div>
                                            </LazyMotion>
                                        </div>
                                        <div className="max-w-full flex-1 text-start">
                                            <div
                                                className={cn(
                                                    "text-xl sm:text-2xl font-medium text-default-foreground transition-[color,opacity] duration-300 group-active:opacity-80",
                                                    {
                                                        "text-grayText": status === "inactive",
                                                        "animate-fadeInDown": status === "active",
                                                    },
                                                )}
                                            >
                                                {step.title}
                                            </div>
                                            <div
                                                className={cn(
                                                    "text-lg sm:text-xl text-grayText font-medium duration-300",
                                                    { "animate-fadeInDown": status === "active" }
                                                )}
                                            >
                                                {step.description}
                                            </div>
                                        </div>
                                    </div>
                                    {stepIdx < steps.length + plusRange - 1 && !hideProgressBars && (
                                        <div
                                            aria-hidden="true"
                                            className="pointer-events-none absolute translate-y-24 ml-2 left-0 w-16 flex-none items-center"
                                            style={{
                                                // @ts-ignore
                                                "--idx": stepIdx,
                                            }}
                                        >
                                            <div
                                                className={cn(
                                                    "relative h-1 w-full rotate-90 bg-[var(--inactive-bar-color)] transition-colors duration-300",
                                                    "after:absolute after:block after:h-full after:w-0 after:bg-[hsl(var(--primary))] after:transition-[width] after:duration-300 after:content-['']",
                                                    {
                                                        "after:w-full": stepIdx < currentStep,
                                                    },
                                                )}
                                            />
                                        </div>
                                    )}
                                </button>
                            </li>
                        );
                    })}
                </ol>
            </nav>
        );
    },
);



VerticalStepsAboutUs.displayName = "RowSteps";
VerticalStepsForecast.displayName = "RowSteps";

