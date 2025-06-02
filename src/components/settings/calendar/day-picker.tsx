// DayWorkingHours.tsx

"use client";

import React, { useState} from "react";
import {Spacer, TimeInput, Switch, Button, DatePicker} from "@heroui/react";
import {getLocalTimeZone, today} from "@internationalized/date";
import {Icon} from "@iconify/react";
import {useTranslations} from "next-intl";


interface DayHoursProps {

}

export const DayHoursComp: React.FC<DayHoursProps> = () => {
    const t = useTranslations("app/(return_page)/settings/components/calendar/day-picker");

    const handleSave = () => {
        // You can now send the workingHours object to the server.
        console.log();
    };

    return (
        <div>
            <div className={'w-full flex flex-col justify-between'}>
                <div>
                    <p className="text-base font-medium text-default-700">{t("specialWorkingHours")}</p>
                    <p className="mt-1 text-sm font-normal text-default-400">{t("selectDaysWithDifferentHours")}</p>
                </div>
                <Spacer y={4}/>
                <DatePicker
                    // @ts-ignore
                    minValue={today(getLocalTimeZone())}
                    className="max-w-[150px]"
                    label={t("stayDuration")}
                    variant={"underlined"}
                    classNames={{
                        label: "text-default-400",
                    }}
                    selectorIcon={<Icon icon={"solar:calendar-broken"}/>}
                />
            </div>
            <Spacer y={4}/>
            <DayExceptionHours />
            <Spacer y={4}/>
            <div className={'w-full flex flex-row-reverse'}>
                <Button
                    aria-label="Edit day"
                    color={'secondary'}
                    className={'shadow'}
                    startContent={<Icon icon={"solar:pen-new-square-broken"} width={24}/>}
                    onPress={handleSave}
                >
                    {t("editDay")}
                </Button>
            </div>
        </div>
    );
};

export const DayExceptionHours: React.FC = () => {
    const t = useTranslations("app/(return_page)/settings/components/calendar/day-picker");
    const [isEnabled, setIsEnabled] = useState(false);
    const [startTime, setStartTime] = useState(undefined);
    const [endTime, setEndTime] = useState(undefined);
    const [isInvalid, setIsInvalid] = useState(false);

    return (
        <div className="mb-4">
            <Spacer y={2}/>
            <div className="flex flex-row">
                <TimeInput
                    isDisabled={!isEnabled}
                    defaultValue={startTime}
                    label={t("startTime")}
                    classNames={{
                        inputWrapper: "rounded-r-none shadow-none",
                    }}
                    isInvalid={isInvalid}
                    labelPlacement="inside"
                    errorMessage={t("pleaseEnterValidTime")}
                />
                <TimeInput
                    isDisabled={!isEnabled}
                    defaultValue={endTime}
                    isInvalid={isInvalid}
                    label={t("endTime")}
                    classNames={{
                        inputWrapper: "rounded-none shadow-none",
                    }}
                    labelPlacement="inside"
                />
                <Switch
                    classNames={{
                        wrapper: "bg-danger",
                    }}
                    isSelected={isEnabled}
                    onValueChange={(newState) => {
                        setIsEnabled(newState);
                    }}
                    className={`${!isInvalid ? "bg-default-100 mb-2" : "bg-danger-50 mb-6"} ${!isEnabled && "opacity-50"} rounded-r-medium px-4`}
                    color={"success"}
                />
            </div>
        </div>
    );
};

