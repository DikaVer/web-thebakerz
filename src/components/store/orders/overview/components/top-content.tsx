"use client";
import React from "react";
import {Icon} from "@iconify/react";
import {Button, Spacer} from "@heroui/react";
import GradientText from "@/components/ui/gradient-text";
import {formatDisplayDateTime, formatScheduledDateTime, formatScheduledTime} from "@/lib/utils";
import {useLocale, useTranslations} from "next-intl";


interface OrderTopContentProps {
    scheduleTime: {
        date: string;
        time: string;
    };
    storeOrderId: string;
}

export const OrderTopContent: React.FC<OrderTopContentProps> = ({scheduleTime, storeOrderId}) => {
    const locale = useLocale();
    const t = useTranslations("TheBakerz");

    return (
        <section id={'Order Top Content'} className={'flex justify-between'}>
            <div className={'flex flex-col w-full max-w-2xl'}>
                <div className={'flex'}>
                    <p>
                        {t("Order")}
                    </p>
                    <Spacer x={1}/>
                    <GradientText>
                        #{storeOrderId}
                    </GradientText>
                </div>
                <p className={'text-sm font-light text-default-600'}>{formatScheduledDateTime(scheduleTime, locale)}</p>
            </div>
            <Button
                startContent={
                    <div className={'w-[24px]'}>
                        <Icon icon={'solar:printer-minimalistic-bold'} width={24} height={24}/>
                    </div>
                }
                color="primary"
                className={'bg-gradient-primary px-8'}
            >
                {t("Print Invoice")}
            </Button>
        </section>
    );
};