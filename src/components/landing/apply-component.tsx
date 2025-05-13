// File: src/components/landing/apply-component.tsx
"use client";

import React from "react";
import { domAnimation, LazyMotion, m } from "framer-motion";
import MultistepSidebar from "./multistep-sidebar";
import ApplyForm from "./apply-form";
import confetti from "canvas-confetti";
import { useTranslations } from "next-intl";
import clarity from "@microsoft/clarity";

const variants = {
    enter: (direction: number) => ({
        y: direction > 0 ? 30 : -30,
        opacity: 0,
    }),
    center: {
        zIndex: 1,
        y: 0,
        opacity: 1,
    },
    exit: (direction: number) => ({
        zIndex: 0,
        y: direction < 0 ? 30 : -30,
        opacity: 0,
    }),
};

export default function ApplyComponent() {
    const [[page, direction], setPage] = React.useState([0, 0]);
    const t = useTranslations("app/(landing)/components/apply");

    const paginate = React.useCallback((newDirection: number) => {
        setPage((prev) => {
            const nextPage = prev[0] + newDirection;
            if (nextPage < 0 || nextPage > 3) return prev;
            return [nextPage, newDirection];
        });
    }, []);

    const onNext = React.useCallback(() => {
        clarity.event("apply_next");
        paginate(1);
    }, [paginate]);

    const content = React.useMemo(() => {
        let component = <ApplyForm onNext={onNext} />;
        switch (page) {
            case 1:
                component = <CongratulationPage />;
                break;
        }
        return (
            <LazyMotion features={domAnimation}>
                <m.div
                    key={page}
                    animate="center"
                    className="col-span-12"
                    custom={direction}
                    exit="exit"
                    initial="exit"
                    transition={{
                        y: {
                            ease: "backOut",
                            duration: 0.35,
                        },
                        opacity: { duration: 0.4 },
                    }}
                    variants={variants}
                >
                    {component}
                </m.div>
            </LazyMotion>
        );
    }, [direction, page, onNext]);

    return (
        <section id="join-thebakerz">
            <MultistepSidebar currentPage={page} onNext={onNext}>
                <div className="relative flex h-fit w-full flex-col pt-6 text-center lg:h-full lg:justify-center lg:pt-0">
                    {content}
                </div>
            </MultistepSidebar>
        </section>
    );
}

const CongratulationPage = () => {
    const t = useTranslations("app/(landing)/components/apply");

    React.useEffect(() => {
        confetti({
            particleCount: 250,
            spread: 300,
            origin: { y: 0.5 },
        });
    }, []);

    return (
        <div className="flex flex-col items-center justify-center h-full text-center">
            <h1 className="text-4xl font-bold mb-4">{t("congratulations")}</h1>
            <p className="text-lg">{t("applicationSuccess")}</p>
        </div>
    );
};