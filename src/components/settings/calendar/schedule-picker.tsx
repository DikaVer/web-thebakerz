'use client';
import React, {useEffect, useMemo, useState} from 'react';
import { Time } from '@internationalized/date';
import { Button, Spacer, Switch, Select, SelectItem } from '@heroui/react';
import { Icon } from '@iconify/react';
import {WorkHours, updateSchedule} from "@/lib/actions/calendar-actions";
import showSuccessMessage from "@/components/toast/toast-succes";
import showErrorMessage from "@/components/toast/toast-error";
import {useSession} from "@/components/providers/session-provider";
import {IconLoadingCircle} from "@/components/ui/icons";
import {useTranslations} from "next-intl";
import { useStore } from '@/components/providers/store-provider';
import { logger } from '@/lib/logger';

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
    
    const t_c = useTranslations();
    const t = useTranslations("app/(return_page)/settings/components/calendar/schedule-picker");

    const [isEnabled, setIsEnabled] = useState(initialEnabled);
    const [startTime, setStartTime] = useState(initialStartTime);
    const [endTime, setEndTime] = useState(initialEndTime);
    const [isInvalid, setIsInvalid] = useState(false);

    // Create time options for select dropdowns
    const timeOptions = useMemo(() => {
        const options = [];
        
        // Add options for every 30 minutes from 00:30 to 23:30
        for (let hour = 0; hour < 24; hour++) {
            for (let minute of [0, 30]) {
                const time = new Time(hour, minute);
                const formattedHour = hour.toString().padStart(2, '0');
                const formattedMinute = minute.toString().padStart(2, '0');
                const label = `${formattedHour}:${formattedMinute}`;
                const value = `${hour}:${minute}`;
                
                options.push({ label, value, time });
            }
        }
        
        return options;
    }, []);

    // Format time to string (HH:MM)
    const formatTimeKey = (time: Time) => {
        return `${time.hour}:${time.minute}`;
    };

    useEffect(() => {
        if(startTime.hour < endTime.hour ||
            (startTime.hour === endTime.hour && startTime.minute < endTime.minute)){
            setIsInvalid(false);
        } else {
            setIsInvalid(true);
        }
    }   , []);

    const handleStartChange = (value: string) => {
        const [hour, minute] = value.split(':').map(Number);
        const newTime = new Time(hour, minute);
        
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
    };

    const handleEndChange = (value: string) => {
        const [hour, minute] = value.split(':').map(Number);
        const newTime = new Time(hour, minute);
        
        setEndTime(newTime);
        setWorkingHours(day, {isEnabled, startTime, endTime: newTime});

        if (
            (newTime.hour > startTime.hour ||
                (newTime.hour === startTime.hour && newTime.minute > startTime.minute))
        ) {
            setIsInvalid(false);
        } else {
            setIsInvalid(true);
        }
    };

    return (
        <div className="mb-4">
            <p className="mt-1 text-xs font-normal text-default-400 capitalize">{t_c(`Working Hours.${day}`)}</p>
            <Spacer y={2} />
            <div className="flex flex-row">
                <Select
                    isDisabled={!isEnabled || isLoading}
                    selectedKeys={[formatTimeKey(startTime)]}
                    onChange={(e) => handleStartChange(e.target.value)}
                    label={t("startTime")}
                    className="w-1/3"
                    classNames={{ 
                        trigger: 'rounded-r-none shadow-none',
                        base: isInvalid ? 'border-danger' : '' 
                    }}
                    labelPlacement="inside"
                    isInvalid={isInvalid}
                    errorMessage={isInvalid ? t("startTimeError") : ""}
                >
                    {timeOptions.map((option) => (
                        <SelectItem key={option.value}>{option.label}</SelectItem>
                    ))}
                </Select>
                <Select
                    isDisabled={!isEnabled || isLoading}
                    selectedKeys={[formatTimeKey(endTime)]}
                    onChange={(e) => handleEndChange(e.target.value)}
                    label={t("endTime")}
                    className="w-1/3"
                    classNames={{ 
                        trigger: 'rounded-none shadow-none',
                        base: isInvalid ? 'border-danger' : '' 
                    }}
                    labelPlacement="inside"
                    isInvalid={isInvalid}
                    errorMessage={isInvalid ? t("endTimeError") : ""}
                >
                    {timeOptions.map((option) => (
                        <SelectItem key={option.value}>{option.label}</SelectItem>
                    ))}
                </Select>
                <Switch
                    classNames={{ wrapper: 'bg-danger-600' }}
                    isSelected={isEnabled || isLoading}
                    onValueChange={(newState) => {
                        setIsEnabled(newState);
                        setWorkingHours(day, { isEnabled: newState, startTime, endTime });
                    }}
                    className={`flex items-center justify-center h-[56px] 
                        ${!isInvalid ? 'bg-default-100' : 'bg-danger-50'} 
                        ${!isEnabled && 'opacity-50'} rounded-r-medium px-4`}
                    color={'success'}
                />
            </div>
        </div>
    );
};

const daysOfWeek = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];

export const WorkingHoursComp: React.FC = () => {
    const t = useTranslations("app/(return_page)/settings/components/calendar/schedule-picker");
    const { session, registerSaveHandler, setSaveOpen } = useSession();
    const { store } = useStore();
    
    // Track if schedule has changed
    const [scheduleChanged, setScheduleChanged] = useState(false);
    
    // Use Partial<WorkHours> as some days might not be set initially.
    const [workingHours, setWorkingHoursState] = useState<Partial<WorkHours>>(store?.schedule ? store?.schedule : {});
    const [isLoading, setIsLoading] = useState(false);
    
    // Store the initial schedule for comparison
    const [initialSchedule, setInitialSchedule] = useState<Partial<WorkHours>>(store?.schedule ? JSON.parse(JSON.stringify(store.schedule)) : {});

    const setWorkingHours = (
        day: string,
        data: { isEnabled: boolean; startTime: Time | null; endTime: Time | null }
    ) => {
        setWorkingHoursState((prev) => {
            const newHours = {
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
            };
            
            // Check if schedule has changed
            const hasChanged = JSON.stringify(newHours) !== JSON.stringify(initialSchedule);
            if (hasChanged && !scheduleChanged) {
                setScheduleChanged(true);
                setSaveOpen(true);
                logger.debug('scheduleSettings', 'schedule changed, showing save button');
            }
            
            return newHours;
        });
    };

    // Register save handler
    useEffect(() => {
        const handleSaveSchedule = async () => {
            logger.debug('scheduleSettings', 'save handler called', { scheduleChanged });
            
            if (!scheduleChanged) {
                logger.debug('scheduleSettings', 'no changes to save');
                return false;
            }
            
            setIsLoading(true);
            try {
                logger.debug('scheduleSettings', 'saving schedule changes');
                const result = await updateSchedule(workingHours, store.id);
                
                if (!result.success) {
                    if (result.status === 500) {
                        showErrorMessage({ error: t("errorSomethingWentWrong") });
                    } else if (result.status === 429) {
                        showErrorMessage({ error: t("errorTooManyRequests") });
                    } else {
                        showErrorMessage({ error: t("errorInvalidTimeFields") });
                    }
                    logger.error('scheduleSettings', 'failed to save schedule', { status: result.status });
                    setIsLoading(false);
                    return false;
                } else {
                    logger.debug('scheduleSettings', 'schedule saved successfully');
                    setInitialSchedule(JSON.parse(JSON.stringify(workingHours)));
                    setScheduleChanged(false);
                    setIsLoading(false);
                    return true;
                }
            } catch (error) {
                logger.error('scheduleSettings', 'error saving schedule', { error });
                showErrorMessage({ error: t("errorFailedToSaveSchedule") });
                setIsLoading(false);
                return false;
            }
        };
        
        logger.debug('scheduleSettings', 'registering save handler');
        registerSaveHandler('working-hours', handleSaveSchedule);
        
        return () => {
            logger.debug('scheduleSettings', 'cleanup - component unmounting');
        };
    }, [registerSaveHandler, scheduleChanged, workingHours, store.id, t, setSaveOpen]);

    if (!session) {
        return null;    
    }

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
        </div>
    );
};

export default WorkingHoursComp;