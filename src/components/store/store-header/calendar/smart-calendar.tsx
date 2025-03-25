// smart-calendar.tsx
'use client';

import React from 'react';
import {CalendarDate, CalendarDateTime, today, ZonedDateTime} from "@internationalized/date";
import { cn } from '@/lib/utils';
import { buttonVariants } from "@/components/ui/button";
import { Calendar, Button, Popover, PopoverContent, PopoverTrigger, ScrollShadow  } from "@heroui/react";
import { Icon } from "@iconify/react";
import {WorkHours} from "@/lib/actions/calendar-actions";
import showSuccessMessage from "@/components/toast/toast-succes";
import { useTranslations } from "use-intl";

// Define props to include schedule and minValue
interface SmartDatetimeInputProps {
    value: CalendarDateTime | CalendarDate | undefined;
    onValueChange: (date: CalendarDate | CalendarDateTime) => void;
    placeholder?: string;
    schedule: WorkHours | undefined;
    minValue: ZonedDateTime |  CalendarDate | CalendarDateTime;
    showCalendar?: boolean;
    showTimePicker?: boolean;
    isError?: boolean;
}

interface SmartDatetimeInputContextProps extends SmartDatetimeInputProps {
    Time: string;
    onTimeChange: (time: string) => void;
}

const SmartDatetimeInputContext = React.createContext<SmartDatetimeInputContextProps | null>(null);

export const formatDate = (date: CalendarDate | CalendarDateTime) => {
    if (date instanceof CalendarDateTime)
        return `${date.hour}:${date.minute === 0 ? "00" : date.minute} ${date.day}-${date.month}-${date.year}`;
    else
        return `${date.day}-${date.month}-${date.year}`;
}

const useSmartDateInput = () => {
    const context = React.useContext(SmartDatetimeInputContext);
    if (!context) {
        throw new Error("useSmartDateInput must be used within SmartDatetimeInputProvider");
    }
    return context;
};

export const SmartDatetimeInput = React.forwardRef<
    HTMLInputElement,
    Omit<React.InputHTMLAttributes<HTMLInputElement>, "type" | "ref" | "value" | "defaultValue" | "onBlur"> &
    SmartDatetimeInputProps
>(
    (
        {
            className,
            value,
            onValueChange,
            placeholder,
            schedule,
            minValue,
            isError = false,
            children
        },
        ref
    ) => {
        const [Time, setTime] = React.useState<string>("");

        const onTimeChange = React.useCallback((time: string) => {
            setTime(time);
        }, []);


        const minDate = minValue;


        return (
            <SmartDatetimeInputContext.Provider
                value={{
                    isError,
                    value,
                    onValueChange,
                    Time,
                    onTimeChange,
                    schedule,
                    minValue: minDate,
                    showTimePicker: true,
                    showCalendar: true,
                }}
            >
                <DateTimeLocalInput
                    placeholder={placeholder}
                    className={className}
                >
                    {children}
                </DateTimeLocalInput>
            </SmartDatetimeInputContext.Provider>
        );
    }
);

SmartDatetimeInput.displayName = "SmartDatetimeInput";

// --- Helper: mapping weekdays to your schedule keys ---
const weekdayMapping = [
    "sunday",
    "monday",
    "tuesday",
    "wednesday",
    "thursday",
    "friday",
    "saturday",
];

// --- Date/Time Input Component ---
type DateTimeLocalInputProps = {
    placeholder?: string;
    children?: React.ReactNode;
} & React.HTMLAttributes<HTMLDivElement>;

const DateTimeLocalInput = ({ children, className, ...props }: DateTimeLocalInputProps) => {
    const { value, onValueChange, schedule, minValue, showCalendar, showTimePicker, isError } =
        useSmartDateInput();

    // Disable dates if they have no available time slots
    const isDateUnavailable = (date: CalendarDate) => {
        if (!schedule) return true;

        const jsDate = new Date(date.year, date.month - 1, date.day);
        const weekday = jsDate.getDay(); // 0 (Sun) to 6 (Sat)
        const dayKey = weekdayMapping[weekday];
        const workDay = schedule[dayKey as keyof WorkHours];

        // Check if the day is disabled in schedule
        if (!workDay || !workDay.isEnabled) return true;

        // Check if there are any available time slots for this date
        const hasAvailableTimeSlots = checkTimeSlotAvailability(date, workDay, minValue);

        return !hasAvailableTimeSlots;
    };

// Helper function to check if a date has any available time slots
    const checkTimeSlotAvailability = (
        date: CalendarDate,
        workDay: { start: { hour: number, minute: number }, end: { hour: number, minute: number } },
        minValue: ZonedDateTime | CalendarDate | CalendarDateTime
    ) => {
        // Working hours range in minutes
        const startTime = workDay.start.hour * 60 + workDay.start.minute;
        const endTime = workDay.end.hour * 60 + workDay.end.minute;

        // If end time is before start time, no slots available
        if (endTime <= startTime) return false;

        // Check if this date is the same as minValue's date
        let minTimeInMinutes = 0;
        let isMinValueDate = false;

        if (minValue) {
            isMinValueDate =
                date.year === minValue.year &&
                date.month === minValue.month &&
                date.day === minValue.day;

            if (isMinValueDate && (minValue instanceof CalendarDateTime || minValue instanceof ZonedDateTime)) {
                minTimeInMinutes = minValue.hour * 60 + minValue.minute;
            }
        }

        // If this is the minValue date and minTime is after the end of work hours, no slots available
        if (isMinValueDate && minTimeInMinutes >= endTime) return false;

        // The effective start time is the later of workDay.start and minTime (if this is minValue's date)
        const effectiveStartTime = isMinValueDate
            ? Math.max(startTime, minTimeInMinutes)
            : startTime;

        // If there's at least 1 minute available in the range, return true
        return effectiveStartTime < endTime;
    };

    // When a date is selected, preserve the existing time (if any) or default to midnight
    const handleCalendarChange = (selectedDate: CalendarDate) => {
        // If the selected date is the same as the current date, do nothing.
        if (
            value &&
            selectedDate.year === value.year &&
            selectedDate.month === value.month &&
            selectedDate.day === value.day
        ) {
            return;
        }
        let newDateTime: CalendarDate;
        if (showTimePicker && value) {
            newDateTime = new CalendarDate(
                selectedDate.year,
                selectedDate.month,
                selectedDate.day
            );
        } else {
            newDateTime = new CalendarDate(selectedDate.year, selectedDate.month, selectedDate.day);
        }

        onValueChange(newDateTime);
    };

    const [isPopoverOpen, setPopoverOpen] = React.useState(false);

    return (
        <Popover
            isOpen={isPopoverOpen}
            onOpenChange={setPopoverOpen}
            placement={'top'}
        >
            <PopoverTrigger onClick={() => setPopoverOpen(true)}>
                {children}
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0 bg-background">
                <div className="flex flex-row gap-1">
                    {showCalendar && (
                        <Calendar
                            id="calendar"
                            className={cn("peer flex justify-end", className)}
                            //@ts-ignore
                            value={value}
                            //@ts-ignore
                            minValue={minValue}
                            //@ts-ignore
                            isDateUnavailable={isDateUnavailable}
                            //@ts-ignore
                            onChange={(selectedDate) => handleCalendarChange(selectedDate)}
                            initialFocus
                        />
                    )}
                    {(showTimePicker && value) && <TimePicker
                        onClose={
                        () => {
                            showSuccessMessage({success: "Time selected successfully"});
                            setPopoverOpen(false)
                        }
                    }
                    />}
                </div>
            </PopoverContent>
        </Popover>
    );
};

// --- TimePicker Component ---
const useTimeSlots = (timestamp: number = 15) => {
    return React.useMemo(() => {
        const slots: { hour: number; minutes: number; label: string }[] = [];
        for (let hour = 0; hour < 24; hour++) {
            for (let part = 0; part < 4; part++) {
                const minutes = part === 0 ? 0 : timestamp * part;
                slots.push({
                    hour,
                    minutes,
                    label: `${hour}:${minutes < 10 ? "0" + minutes : minutes}`,
                });
            }
        }
        return slots;
    }, [timestamp]);
};

const TimePicker = ({onClose}: {onClose: () => void}) => {
    const { value, onValueChange, onTimeChange, schedule, minValue } = useSmartDateInput();
    const [activeIndex, setActiveIndex] = React.useState(-1);
    const timestamp = 15; // 15-minute intervals
    const t = useTranslations("app/(store)/components/smart-calendar");

    // Generate candidate time slots (optimized)
    const slots = useTimeSlots(timestamp);

    // Determine allowed time range based on the schedule for the selected day.
    const allowedRange = React.useMemo(() => {
        if (!value) return null;
        if (!schedule) {
            return null;
        }
        const jsDate = new Date(value.year, value.month - 1, value.day);
        const weekday = jsDate.getDay();
        const dayKey = weekdayMapping[weekday];
        const workDay = schedule[dayKey as keyof WorkHours];
        if (workDay && workDay.isEnabled) {
            return {
                startHour: workDay.start.hour,
                startMinute: workDay.start.minute,
                endHour: workDay.end.hour,
                endMinute: workDay.end.minute,
            };
        }
        return null;
    }, [value, schedule]);

    // Helper to check if a slot is within allowed range.
    const isWithinRange = (hour: number, minute: number) => {
        if (!allowedRange) return true;

        // Check if the slot is within working hours
        const slotTime = hour * 60 + minute;
        const startTime = allowedRange.startHour * 60 + allowedRange.startMinute;
        const endTime = allowedRange.endHour * 60 + allowedRange.endMinute;
        const withinWorkHours = slotTime >= startTime && slotTime <= endTime;

        // Check if the slot is after or equal to minValue (only when the selected date is the same as minValue)
        let afterOrEqualMinTime = true;
        if (value && minValue) {
            const isSameDate =
                value.year === minValue.year &&
                value.month === minValue.month &&
                value.day === minValue.day;

            if (isSameDate) {
                if (minValue instanceof CalendarDateTime || minValue instanceof ZonedDateTime) {
                    const minTime = minValue.hour * 60 + minValue.minute;
                    afterOrEqualMinTime = slotTime >= minTime;
                } else {
                    // If minValue is just a date with no time, default to start of day
                    afterOrEqualMinTime = true;
                }
            }
        }

        return withinWorkHours && afterOrEqualMinTime;
    };


    // Build a new CalendarDateTime from the current date and selected time.
    const formatSelectedTime = React.useCallback(
        (hour: number, minutes: number) => {
            const currentYear = value?.year || today("Europe/Amsterdam").year;
            const currentMonth = value?.month || today("Europe/Amsterdam").month;
            const currentDay = value?.day || today("Europe/Amsterdam").day;
            const newDateTime = new CalendarDateTime(
                currentYear,
                currentMonth,
                currentDay,
                hour,
                minutes
            );
            onTimeChange(`${hour}:${minutes < 10 ? "0" + minutes : minutes}`);
            onValueChange(newDateTime);
        },
        [value, onValueChange, onTimeChange]
    );

    const handleClick = React.useCallback(
        (hour: number, minutes: number, index: number) => {
            formatSelectedTime(hour, minutes);
            setActiveIndex(index);
            onClose();
        },
        [formatSelectedTime]
    );

    return (
        <div className="space-y-2 pr-3 py-3 relative">
            <h3 className="text-sm text-default-500 font-medium text-center">{t("time")}</h3>
            <ScrollShadow size={20} className="h-[90%] w-full">
                <ul className={cn("flex items-center flex-col gap-1 h-full max-h-56 w-28 px-1 py-0.5")}>
                    {slots.map((slot, index) => {
                        if (!isWithinRange(slot.hour, slot.minutes)) return null;
                        // Use formatted candidate time.
                        const candidateTime = slot.label;

                        let isSelected = false;
                        if(value instanceof CalendarDateTime) {
                            isSelected = value && value.hour === slot.hour && value.minute === slot.minutes;
                        }

                        return (
                            <li
                                tabIndex={isSelected ? 0 : -1}
                                id={`time-${index}`}
                                key={`time-${index}`}
                                className={cn(
                                    buttonVariants({
                                        variant: isSelected ? "default" : "outline",
                                    }),
                                    "h-8 px-3 w-full text-sm cursor-default"
                                )}
                                onClick={() => handleClick(slot.hour, slot.minutes, index)}
                            >
                                {candidateTime}
                            </li>
                        );
                    })}
                </ul>
            </ScrollShadow>
        </div>
    );
};


