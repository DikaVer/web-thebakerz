// TypeScript
"use client";

import React from "react";
import { Button } from "@heroui/react";
import { Icon } from "@iconify/react";
import { cn } from "@heroui/react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";

export type SupportCardProps = React.HTMLAttributes<HTMLDivElement>;

const SupportCard = React.forwardRef<HTMLDivElement, SupportCardProps>(
    ({ className, ...props }, ref) => {
        const router = useRouter();
        const t = useTranslations("app/(landing)/components/support-card");

        const handleClick = () => {
            router.push("/support/contact-us");
        };

        return (
            <div
                {...props}
                ref={ref}
                className={cn(
                    "align-center my-2 flex shrink-0 items-center justify-center gap-3 self-stretch rounded-large bg-content1 px-3 py-3 shadow-small",
                    className
                )}
            >
                <div className="line-clamp-2 text-left text-tiny font-medium text-default-700">
                    {t("supportCardMessage")}
                </div>
                <Button
                    aria-label="Contact us"
                    isIconOnly
                    className="align-center flex h-[32px] w-[31px] justify-center rounded-[12px] bg-default-100 dark:bg-[#27272A]/[.4]"
                    size="sm"
                    variant="flat"
                    onPress={handleClick}
                >
                    <Icon
                        className="text-default-400 dark:text-foreground [&>g>path:nth-child(1)]:stroke-[3px] [&>g>path:nth-child(2)]:stroke-[2.5px]"
                        icon="solar:chat-round-dots-linear"
                        width={20}
                    />
                </Button>
            </div>
        );
    }
);

SupportCard.displayName = "SupportCard";

export default SupportCard;