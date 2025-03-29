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
import { StoreSubHeader } from "@/components/store/store-header/store-subheader";
import { renderCalendarContent } from "@/components/store/store-header/subheader/working-hours";
import { useTranslations } from "next-intl";
import {useDebouncedCallback} from "use-debounce";
import {getDeliveryMode, setDeliveryMode} from "@/lib/delivery-cookie";

interface StoreSubHeaderProps {
    isDeliveryProps: boolean;
    handleNext: () => void;
}

type SocialIconProps = Omit<IconProps, "icon">;

export function ScheduleOrder({
                                    isDeliveryProps,
                                  handleNext,
                              }: StoreSubHeaderProps) {
    const { store } = useStore();
    const [selectedDate, setSelectedDate] = useState<
        CalendarDateTime | CalendarDate | undefined
    >();

    const t = useTranslations("app/(store)/components/checkout");
    const [isDelivery, setIsDelivery] = React.useState(isDeliveryProps);
    const [isTogglingDelivery, setIsTogglingDelivery] = useState(false);
    const [isSubheaderLoaded, setIsSubheaderLoaded] = useState(true);


    const handleDeliveryToggle = async (value: boolean) => {
        // Skip if we're already toggling or if the value didn't change
        if (isTogglingDelivery) return;

        setIsTogglingDelivery(true);
        setIsDelivery(value);
        await setDeliveryMode(value ? 'delivery' : 'pickup');
        setIsTogglingDelivery(false);
    };
    // Handler to update subheader loaded state
    const handleSubheaderLoaded = (loaded: boolean) => {
        if (loaded !== isSubheaderLoaded) {
            setIsSubheaderLoaded(loaded);
        }
    };

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
                {(store.deliveryOption === "multi") && (
                    <div className="flex items-center justify-end w-full py-4">
                        <div className="relative p-1 rounded-xl bg-default-100 shadow-sm">
                            <ButtonGroup className="relative z-10 overflow-hidden" isDisabled={isTogglingDelivery || !isSubheaderLoaded}>
                                <Button
                                    disableRipple
                                    onPress={() => handleDeliveryToggle(false)}
                                    className={cn(
                                        "min-w-32 transition-all duration-300 data-[hover=true]:bg-transparent",
                                        !isDelivery ? "text-primary font-medium" : "text-default-500 font-normal",
                                        isTogglingDelivery || !isSubheaderLoaded ? "opacity-50" : "opacity-100"
                                    )}
                                    variant="light"
                                    isDisabled={isTogglingDelivery || !isSubheaderLoaded}
                                >
                                    <div className="flex items-center gap-2">
                                        <Icon
                                            icon="solar:shop-2-bold"
                                            width={20}
                                            height={20}
                                            className={cn(
                                                "transition-all duration-300",
                                                !isDelivery ? "text-primary" : "text-default-500"
                                            )}
                                        />
                                        <span className="text-sm">{t('pickup')}</span>
                                    </div>
                                </Button>
                                <Button
                                    disableRipple
                                    onPress={() => handleDeliveryToggle(true)}
                                    className={cn(
                                        "min-w-32 transition-all duration-300 data-[hover=true]:bg-transparent",
                                        isDelivery ? "text-primary font-medium" : "text-default-500 font-normal",
                                        isTogglingDelivery || !isSubheaderLoaded ? "opacity-50" : "opacity-100"
                                    )}
                                    variant="light"
                                    isDisabled={isTogglingDelivery || !isSubheaderLoaded}
                                >
                                    <div className="flex items-center gap-2">
                                        <Icon
                                            icon="solar:scooter-bold"
                                            width={20}
                                            height={20}
                                            className={cn(
                                                "transition-all duration-300",
                                                isDelivery ? "text-primary" : "text-default-500"
                                            )}
                                        />
                                        <span className="text-sm">{t('delivery')}</span>
                                    </div>
                                </Button>
                            </ButtonGroup>
                            {/* Animated background pill */}
                            <div
                                className={cn(
                                    "absolute top-1 bottom-1 w-[calc(50%-2px)] rounded-lg bg-default-50 dark:bg-default-700 shadow-md transition-all duration-300",
                                    isDelivery ? "translate-x-[calc(100%+2px)]" : "translate-x-[1px]"
                                )}
                                style={{
                                    left: 0
                                }}
                            />
                        </div>
                    </div>
                )}
                <StoreSubHeader
                    isDelivery={isDelivery}
                    key={`subheader-${isDelivery ? 'delivery' : 'pickup'}`}
                    onLoadingStateChange={handleSubheaderLoaded}
                    setSelectedGlobalDate={setSelectedDate}
                />
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