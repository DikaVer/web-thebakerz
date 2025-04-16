"use client";

import React, { useEffect, useState } from "react";
import {
    Accordion,
    AccordionItem,
    Alert,
    Button, ButtonGroup, cn,
    Divider,
    Link,
    Spacer,
} from "@heroui/react";

import { Icon, IconProps } from "@iconify/react";
import { useRouter, useSearchParams } from "next/navigation";
import { CalendarDateTime, CalendarDate } from "@internationalized/date";

import { useStore } from "@/components/providers/store-provider";
import { parseDateParams } from "@/components/store/store-header/calendar/calendar-params";
import { DeliverySubheader } from "@/components/store/store-header/delivery-subheader";
import { renderCalendarContent } from "@/components/store/store-header/subheader/working-hours";
import { useTranslations } from "next-intl";
import {useDebouncedCallback} from "use-debounce";
import {getDeliveryMode, setDeliveryMode} from "@/lib/delivery-cookie";
import {useDelivery} from "@/components/providers/delivery-provider";

interface StoreSubHeaderProps {
    handleNext: () => void;
}

type SocialIconProps = Omit<IconProps, "icon">;

export function ScheduleOrder({
                                  handleNext,
                              }: StoreSubHeaderProps) {
    const { store } = useStore();
    const t = useTranslations("app/(store)/components/checkout");
    const {
        isDelivery,
        selectedDate
    } = useDelivery();


    const phone = {
        name: t("phone"),
        href: `tel:${store?.phone}`,
        icon: (props: SocialIconProps) => (
            <Icon {...props} icon="line-md:phone-call" strokeWidth={1.5} width={24} />
        ),
    };

    return (
        <div className={'w-full flex flex-col items-center'}>
            <div className={'flex flex-col gap-y-4 w-full max-w-[440px]'}>
                <Alert
                    key={"Pick Up Only Alert"}
                    className={'bg-default-100'}
                    classNames={{
                        title: 'text-md',
                    }}
                    title={t("alert")}
                    variant={"solid"}
                />
                <Divider />

                <Accordion
                    selectedKeys={["Working Hours"]}
                    variant="light"
                    className={'px-0'}
                >
                    <AccordionItem
                        key="Working Hours"
                        aria-label={t("workingHours")}
                        title={t("openingHours")}
                        className={'px-0 cursor-default text-default-500'}
                        classNames={{
                            title: 'text-default-500',
                            trigger: 'py-0 cursor-default',
                        }}
                        startContent={
                            <Icon
                                icon={'solar:clock-circle-outline'}
                                className={'text-default-500'}
                                width={24}
                            />
                        }
                        indicator={<></>}
                    >
                        <>
                            <Spacer y={2} />
                            {renderCalendarContent()}
                        </>
                    </AccordionItem>
                </Accordion>
                {store?.phone && (
                    <>
                        <Divider />
                        <Link
                            key={"Phone"}
                            isExternal
                            className="text-default-500 justify-between"
                            href={phone.href}
                        >
                            <div className={'flex gap-x-4'}>
                                <phone.icon aria-hidden="true" />
                                <p className={' text-md'}>{store.phone}</p>
                                <span className="sr-only">{phone.name}</span>
                            </div>
                            <Icon icon={'mi:arrow-right-up'} width={24} />
                        </Link>
                    </>
                )}
                <Divider />
            </div>
            <div className={'flex flex-col w-full justify-center max-w-[440px]'}>
                <DeliverySubheader/>
            </div>
            <Spacer y={4} />
            <div className={'flex flex-row w-full justify-center'}>
                <Button
                    variant={'bordered'}
                    isDisabled={!(selectedDate instanceof CalendarDateTime)}
                    className={`${
                        !(selectedDate instanceof CalendarDateTime)
                            ? ""
                            : "bg-gradient-primary text-white border-none"
                    }  w-full max-w-[440px]`}
                    endContent={
                        <Icon icon={'solar:alt-arrow-right-linear'} width={24} />
                    }
                    onPress={() => {
                        if (selectedDate instanceof CalendarDateTime) {
                            handleNext();
                        }
                    }}
                >
                    {isDelivery ? t("saveDeliveryDetails") : t("savePickUpDetails")}
                </Button>
            </div>
        </div>
    );
}