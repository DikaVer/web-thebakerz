'use client';
import React, {useEffect, useState} from 'react';
import { Time } from '@internationalized/date';
import { Button, Spacer, Switch, TimeInput } from '@heroui/react';
import { Icon } from '@iconify/react';
import {WorkHours} from "@/lib/actions/calendar-actions";
import showSuccessMessage from "@/components/toast/toast-succes";
import showErrorMessage from "@/components/toast/toast-error";
import {useSession} from "@/components/providers/session-provider";
import {IconLoadingCircle} from "@/components/ui/icons";
import {useTranslations} from "next-intl";

interface DayWorkingHoursProps {
    day: string;
    isLoading: boolean;
    // Callback to update the working hours in the parent
    setWorkingHours: (
        day: string,
        data: { isEnabled: boolean; startTime: Time | null; endTime: Time | null }
    ) => void;
    // Optional initial values
    initialEnabled?: boolean;
    initialStartTime?: Time;
    initialEndTime?: Time;
}

const DayWorkingHours: React.FC<DayWorkingHoursProps> = ({
                                                             day,
                                                             isLoading,
                                                             setWorkingHours,
                                                             initialEnabled = false,
                                                             // Default start/end times (you can adjust these defaults)
                                                             initialStartTime = new Time(9, 0),
                                                             initialEndTime = new Time(17, 0),
                                                         }) => {
    const t = useTranslations("Schedule");
    const whT = useTranslations("Working Hours");

    const [isEnabled, setIsEnabled] = useState(initialEnabled);
    const [startTime, setStartTime] = useState(initialStartTime);
    const [endTime, setEndTime] = useState(initialEndTime);
    const [isInvalid, setIsInvalid] = useState(false);

    useEffect(() => {
        if(startTime.hour < endTime.hour ||
            (startTime.hour === endTime.hour && startTime.minute < endTime.minute)){
            setIsInvalid(false);
        } else {
            setIsInvalid(true);
        }
    }   , []);

    const handleStartChange = (newTime: Time | null) => {

        if(newTime &&
            endTime){
            setStartTime(newTime);
            setWorkingHours(day, { isEnabled, startTime: newTime, endTime });

            if (
                (newTime.hour < endTime.hour ||
                    (newTime.hour === endTime.hour && newTime.minute < endTime.minute))
            ) {
                setIsInvalid(false);
            } else {
                setIsInvalid(true);
            }
        }
        // Validate: start must be before end
    };

    const handleEndChange = (newTime: Time | null) => {
        // Validate: end must be after start
        if (
            newTime &&
            startTime) {

            setEndTime(newTime);
            setWorkingHours(day, {isEnabled, startTime, endTime: newTime});

            if (
                newTime &&
                startTime &&
                (newTime.hour > startTime.hour ||
                    (newTime.hour === startTime.hour && newTime.minute > startTime.minute))
            ) {
                setEndTime(newTime);
                setWorkingHours(day, {isEnabled, startTime, endTime: newTime});
                setIsInvalid(false);
            } else {
                setIsInvalid(true);
            }
        }
    };

    return (
        <div className="mb-4">
            <p className="mt-1 text-xs font-normal text-default-400 capitalize">{whT(day)}</p>
            <Spacer y={2} />
            <div className="flex flex-row">
                <TimeInput
                    isDisabled={!isEnabled || isLoading}
                    // @ts-ignore
                    defaultValue={startTime}
                    label={t("StartTime")}
                    classNames={{ inputWrapper: 'rounded-r-none shadow-none' }}
                    isInvalid={isInvalid}
                    labelPlacement="inside"
                    errorMessage={t("StartTimeError")}
                    // @ts-ignore
                    onChange={handleStartChange}
                />
                <TimeInput
                    isDisabled={!isEnabled || isLoading}
                    // @ts-ignore
                    defaultValue={endTime}
                    isInvalid={isInvalid}
                    label={t("EndTime")}
                    classNames={{ inputWrapper: 'rounded-none shadow-none' }}
                    labelPlacement="inside"
                    errorMessage={t("EndTimeError")}
                    // @ts-ignore
                    onChange={handleEndChange}
                />
                <Switch
                    classNames={{ wrapper: 'bg-danger-600' }}
                    isSelected={isEnabled || isLoading}
                    onValueChange={(newState) => {
                        setIsEnabled(newState);
                        setWorkingHours(day, { isEnabled: newState, startTime, endTime });
                    }}
                    className={`${
                        !isInvalid ? 'bg-default-100 mb-2' : 'bg-danger-50 mb-6'
                    } ${!isEnabled && 'opacity-50'} rounded-r-medium px-4`}
                    color={'success'}
                />
            </div>
        </div>
    );
};

const daysOfWeek = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];

export const WorkingHoursComp: React.FC = () => {
    const t = useTranslations("Schedule");
    const {session} = useSession();

    if (!session) {
        return null;
    }
    const { schedule } = session;
    // Use Partial<WorkHours> as some days might not be set initially.
    const [workingHours, setWorkingHoursState] = useState<Partial<WorkHours>>(schedule ? schedule : {});
    const [isLoading, setIsLoading] = useState(false);

    const setWorkingHours = (
        day: string,
        data: { isEnabled: boolean; startTime: Time | null; endTime: Time | null }
    ) => {
        setWorkingHoursState((prev) => ({
            ...prev,
            [day]: {
                isEnabled: data.isEnabled,
                start: data.startTime
                    ? { hour: data.startTime.hour, minute: data.startTime.minute }
                    : { hour: 0, minute: 0 },
                end: data.endTime
                    ? { hour: data.endTime.hour, minute: data.endTime.minute }
                    : { hour: 0, minute: 0 },
            },
        }));
    };

    const handleSave = async () => {
        setIsLoading(true);
        try {
            const res = await fetch('/api/update-schedule', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    workHours: workingHours,
                }),
            });
            if (!res.ok) {
                if (res.status === 500) {
                    showErrorMessage({ error: t("ErrorSomethingWentWrong") });
                } else if (res.status === 429) {
                    showErrorMessage({ error: t("ErrorTooManyRequests") });
                } else {
                    showErrorMessage({ error: t("ErrorInvalidTimeFields") });
                }
            } else {
                showSuccessMessage({success: t("ScheduleSavedSuccess")});
            }
        } catch (error) {
            console.error('Error saving schedule:', error);
            showErrorMessage({ error: t("ErrorFailedToSaveSchedule") });
        }
        setIsLoading(false);
    };

    return (
        <div>
            {isLoading ? (
                <div className="w-full flex justify-center h-[640px]">
                    <div className={'h-full flex flex-col justify-center'}>
                        <IconLoadingCircle strokeWidth={2} className="text-grayText w-40 h-40"/>
                    </div>
                </div>
            ) : (
                daysOfWeek.map((day) => (
                    <div key={day}>
                        <DayWorkingHours
                            day={day}
                            isLoading={isLoading}
                            // @ts-ignore
                            initialEnabled={workingHours[day]?.isEnabled ?? false}
                            initialStartTime={
                                // @ts-ignore
                                workingHours[day]?.start
                                    // @ts-ignore
                                    ? new Time(workingHours[day].start.hour, workingHours[day].start.minute)
                                    : new Time(9, 0)
                            }
                            initialEndTime={
                                // @ts-ignore
                                workingHours[day]?.end
                                    // @ts-ignore
                                    ? new Time(workingHours[day].end.hour, workingHours[day].end.minute)
                                    : new Time(17, 0)
                            }
                            setWorkingHours={setWorkingHours}
                        />
                    </div>
                ))
            )}
            <div className="w-full flex flex-row-reverse">
                <Button
                    color={'secondary'}
                    className={'shadow'}
                    startContent={!isLoading && <Icon icon="solar:pen-new-square-broken" width={24} />}
                    onPress={handleSave}
                    isLoading={isLoading}
                >
                    {isLoading ? t("Saving") : t("SaveWorkingHours")}
                </Button>
            </div>
        </div>
    );
};

export default WorkingHoursComp;