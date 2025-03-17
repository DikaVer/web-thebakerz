// DayWorkingHours.tsx

"use client";

import React, { useState} from "react";
import {Spacer, TimeInput, Switch, Button, DatePicker} from "@heroui/react";
import {getLocalTimeZone, today} from "@internationalized/date";
import {Icon} from "@iconify/react";

interface DayHoursProps {

}

export const DayHoursComp: React.FC<DayHoursProps> = () => {


    const handleSave = () => {
        // You can now send the workingHours object to the server.
        console.log();
    };

    return (
        <div>
            <div className={'w-full flex flex-col justify-between'}>
                <div>
                    <p className="text-base font-medium text-default-700">Special Working Hours</p>
                    <p className="mt-1 text-sm font-normal text-default-400">Select Days with differe</p>
                </div>
                <Spacer y={4}/>
                <DatePicker
                    // @ts-ignore
                    minValue={today(getLocalTimeZone())}
                    className="max-w-[150px]"
                    label="Stay duration"
                    variant={"underlined"}
                    classNames={{
                        label: "text-default-400",
                    }}
                    selectorIcon={<Icon icon={"solar:calendar-broken"}/>}
                    // Your DateRangePicker handler here...
                    // onChange={(date: CalendarDate | null) => {
                    //
                    // }}
                />
            </div>
            <Spacer y={4}/>
            <DayExceptionHours //ToDO: add intial values from database

            />
            <Spacer y={4}/>
            <div className={'w-full flex flex-row-reverse'}>
                <Button
                    color={'secondary'}
                    className={'shadow'}
                    startContent={<Icon icon={"solar:pen-new-square-broken"} width={24}/>}
                    onPress={handleSave}
                >
                    Edit Day
                </Button>
            </div>
        </div>
    );
};

export const DayExceptionHours: React.FC = () => {
    // Use a more intuitive name: when isEnabled is true, the time inputs are enabled.
    const [isEnabled, setIsEnabled] = useState(false);
    const [startTime, setStartTime] = useState(undefined);
    const [endTime, setEndTime] = useState(undefined);
    const [isInvalid, setIsInvalid] = useState(false);

    return (
        <div className="mb-4">
            <Spacer y={2}/>
            <div className="flex flex-row">
                <TimeInput
                    // If isEnabled is true then the inputs are active (so we pass the inverse)
                    isDisabled={!isEnabled}
                    defaultValue={startTime}
                    label="Start Time"
                    classNames={{
                        inputWrapper: "rounded-r-none shadow-none",
                    }}
                    isInvalid={isInvalid}
                    labelPlacement="inside"
                    errorMessage="Please enter a valid time"
                    // Optionally, you might handle onChange to update the time:
                    // onChange={(newTime: Time | null) => {
                    //
                    //     if (newTime && endTime && newTime.hour < endTime.hour) {
                    //         setIsInvalid(false);
                    //     } else {
                    //         setIsInvalid(true);
                    //     }
                    //
                    // }}
                />
                <TimeInput
                    isDisabled={!isEnabled}
                    defaultValue={endTime}
                    isInvalid={isInvalid}
                    label="End Time"
                    classNames={{
                        inputWrapper: "rounded-none shadow-none",
                    }}
                    labelPlacement="inside"
                    // onChange={(newTime: Time | null) => {
                    //     if (newTime && endTime && newTime.hour < endTime.hour) {
                    //         setIsInvalid(false);
                    //     } else {
                    //         setIsInvalid(true);
                    //     }
                    // }}
                />
                <Switch
                    classNames={{
                        wrapper: "bg-danger",
                    }}
                    isSelected={isEnabled}
                    // Toggle the enabled state when the switch value changes.
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

