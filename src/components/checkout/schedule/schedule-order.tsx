"use client";

import React, {useEffect, useState} from "react";
import {
    Accordion, AccordionItem,
    Alert,
    Button, Divider, Link,
    Spacer
} from "@heroui/react";

import {Icon, IconProps} from "@iconify/react";
import {useRouter, useSearchParams} from "next/navigation";
import {CalendarDateTime, CalendarDate} from "@internationalized/date";

import {useStore} from "@/components/providers/store-provider";
import {
    parseDateParams,

} from "@/components/store/store-header/calendar/calendar-params";
import {StoreSubHeader} from "@/components/store/store-header/store-subheader";
import {renderCalendarContent} from "@/components/store/store-header/subheader/working-hours";
import {useTranslations} from "next-intl";


interface StoreSubHeaderProps {
    dateParam: string | null;
    timeParam: string | null;
    handleNext: () => void;
}

type SocialIconProps = Omit<IconProps, "icon">;

export function ScheduleOrder({ dateParam, timeParam, handleNext}: StoreSubHeaderProps) {
    const searchParams = useSearchParams();
    const { store } = useStore();
    const [selectedDate, setSelectedDate] = useState<CalendarDateTime | CalendarDate | undefined>(parseDateParams(`${dateParam} ${timeParam}`));

    const t = useTranslations ("Schedule Order");
    const phone = {
        name: "Phone",
        href: `tel:${store?.phone}`,
        icon: (props: SocialIconProps) => <Icon {...props} icon="line-md:phone-call" strokeWidth={1.5} width={24}/>,
    };



    useEffect(() => {
        const dateParam = searchParams.get("date");
        const timeParam = searchParams.get("time");
        setSelectedDate(parseDateParams(`${dateParam} ${timeParam}`));
        // Add your handling logic here.
    }, [searchParams]);



    return (
        <div className={'w-full flex flex-col items-center'}>
            <div className={'flex flex-col gap-y-4 w-full max-w-[440px]'}>
                <Alert
                    key={"Pick Up Only Alert"}
                    className={'bg-default-100'}
                    classNames={{
                        title: 'text-md'
                    }}
                    title={t("Alert")}
                    variant={"solid"}
                />
                <Divider/>

                <Accordion
                    selectedKeys={["Working Hours"]}
                    variant="light"
                    className={'px-0'}
                >
                    <AccordionItem
                        key="Working Hours"
                        aria-label="Working Hours"
                        title={t("Opening Hours")}
                        className={'px-0 cursor-default text-default-500'}
                        classNames={{
                            title: 'text-default-500',
                            trigger: 'py-0 cursor-default',
                        }}
                        startContent={<Icon icon={'solar:clock-circle-outline'} className={'text-default-500'} width={24}/> }
                        indicator={<></>}
                    >
                        <>
                            <Spacer y={2}/>
                            {renderCalendarContent()}
                        </>
                    </AccordionItem>
                </Accordion>
                {store?.phone &&
                    <>
                        <Divider/>
                        <Link key={"Phone"} isExternal className="text-default-500 justify-between"
                              href={phone.href}>
                            <div className={'flex gap-x-4'}>
                                <phone.icon aria-hidden="true"/>
                                <p className={' text-md'}>
                                    {store.phone}
                                </p>
                                <span className="sr-only">{phone.name}</span>
                            </div>
                            <Icon icon={'mi:arrow-right-up'} width={24}/>
                        </Link>
                    </>
                }
                <Divider/>
            </div>
            <div className={'flex flex-row w-full justify-center'}>
                <StoreSubHeader dateParam={dateParam} timeParam={timeParam}/>
            </div>
            <Spacer y={4}/>
            <div className={'flex flex-row w-full justify-center'}>
                <Button
                    variant={'bordered'}
                    isDisabled={!(selectedDate instanceof CalendarDateTime)}
                    className={`${!(selectedDate instanceof CalendarDateTime) ? "" : "bg-gradient-primary text-white border-none"}  w-full max-w-[440px]`}
                    endContent={<Icon icon={'solar:alt-arrow-right-linear'} width={24}/>}
                    onPress={() => {
                        if (selectedDate instanceof CalendarDateTime) {
                            handleNext();
                        }
                    }}
                >
                    Save Pick Up Details
                </Button>
            </div>
        </div>
    );
}
