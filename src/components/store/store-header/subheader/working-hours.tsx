'use client';

// --- 1. CalendarTopContent: Render working hours (or Closed) for the selected day ---
import {Button, Card, CardBody, Dropdown, DropdownMenu, DropdownTrigger, Spacer, Tooltip} from "@heroui/react";
import {Icon} from "@iconify/react";
import {WorkDay} from "@/lib/actions/calendar-actions";
import {useStore} from "@/components/providers/store-provider";
import {useMediaQuery} from "usehooks-ts";
import {StoreData} from "@/lib/actions/store";

// --- Helper to get a short weekday name ---
function getShortWeekday(weekday: string): string {
    const daysMap: { [key: string]: string } = {
        sunday: "Sun",
        monday: "Mon",
        tuesday: "Tue",
        wednesday: "Wed",
        thursday: "Thu",
        friday: "Fri",
        saturday: "Sat"
    };
    return daysMap[weekday] || "";
}

// --- Helper to pad numbers with a leading zero ---
function pad(num: number): string {
    return num < 10 ? `0${num}` : `${num}`;
}

export const renderCalendarTopContent = () => {

    const { store } = useStore();

    const isSmall = useMediaQuery("(max-width: 768px)");

    if (!store?.schedule) {
        return <div className="w-full mx-2 max-w-52 text-default-500 text-center">No schedule available</div>;
    }

    return isSmall ? renderWorkingHoursDropdown({ store }) : renderWorkingHoursTooltip({ store });

};

export const renderWorkingHoursTooltip = ({store} : {store: StoreData}) => {
    return (
        <Tooltip
            content={
                <div className="flex flex-wrap items-center justify-center max-w-52">
                    {["monday", "friday", "tuesday", "thursday", "wednesday", "saturday", "sunday"].map((day, index) => {
                        //@ts-ignore
                        const workday = store.schedule[day];

                        const shortDay = getShortWeekday(day);
                        let displayText = `Closed`;
                        if (workday && (workday as WorkDay).isEnabled) {
                            const wd = workday as WorkDay;
                            const startHour = pad(wd.start.hour);
                            const startMinute = pad(wd.start.minute);
                            const endHour = pad(wd.end.hour);
                            const endMinute = pad(wd.end.minute);
                            displayText = `${startHour}:${startMinute} - ${endHour}:${endMinute}`;
                        }

                        const isSunday = day === "sunday";

                        return (
                            <div
                                key={day}
                                className={`${isSunday ? "ml-4 w-[40%] text-start" : `w-1/2 ${index % 2 == 0 ? 'text-start' : 'text-end'} `} flex flex-col`}
                            >
                                <span className="text-sm font-medium text-default-600">
                                  {day.charAt(0).toUpperCase() + day.slice(1)}
                                </span>
                                <p className="text-default-500 text-xs font-light">
                                    {displayText}
                                </p>
                            </div>
                        );
                    })}
                </div>
            }
        >
                <Button
                    size={"sm"}
                    variant="bordered"
                    radius={'lg'}
                    className={'text-default-600 bg-gradient-card w-full'}
                    startContent={ <Icon icon={"solar:sort-by-time-linear"} width={24} className={"text-default-500"}/>}
                >
                    View Schedule
                </Button>
        </Tooltip>
    );
}

export const renderWorkingHoursDropdown = ({store} : {store: StoreData}) => {
    return (
        <Dropdown
            placement={"top"}
            isDismissable={false}
            backdrop={"blur"}
        >
            <DropdownTrigger>
                <Button
                    size={"sm"}
                    variant="bordered"
                    radius={'full'}
                    className={'text-default-600 bg-gradient-card w-full'}
                    startContent={ <Icon icon={"solar:sort-by-time-linear"} width={24} className={"text-default-500"}/>}
                >
                    <p className={'w-[90%] truncate'}>
                        Working Hours
                    </p>
                </Button>
            </DropdownTrigger>
            <DropdownMenu
                aria-label="Link Actions"
                emptyContent={
                    <div className="flex flex-wrap items-center justify-center max-w-52">
                        {["monday", "friday", "tuesday", "thursday", "wednesday", "saturday", "sunday"].map((day, index) => {
                            //@ts-ignore
                            const workday = store.schedule[day];

                            const shortDay = getShortWeekday(day);
                            let displayText = `Closed`;
                            if (workday && (workday as WorkDay).isEnabled) {
                                const wd = workday as WorkDay;
                                const startHour = pad(wd.start.hour);
                                const startMinute = pad(wd.start.minute);
                                const endHour = pad(wd.end.hour);
                                const endMinute = pad(wd.end.minute);
                                displayText = `${startHour}:${startMinute} - ${endHour}:${endMinute}`;
                            }

                            const isSunday = day === "sunday";

                            return (
                                <div
                                    key={day}
                                    className={`${isSunday ? "ml-4 w-[40%] text-start" : `w-1/2 ${index % 2 == 0 ? 'text-start' : 'text-end'} `} flex flex-col`}
                                >
                                <span className="text-sm font-medium text-default-600">
                                  {day.charAt(0).toUpperCase() + day.slice(1)}
                                </span>
                                    <p className="text-default-500 text-xs font-light">
                                        {displayText}
                                    </p>
                                </div>
                            );
                        })}
                    </div>
                }
            >
                {null}
            </DropdownMenu>
        </Dropdown>
    );
}

export const renderCalendarContent = () => {

    const { store } = useStore();

    if (!store?.schedule) {
        return <div className="w-full max-w-52 text-default-500 text-center">No schedule available</div>;
    }

    return (
        <>
            <Card
                className={'bg-gradient-card w-full max-w-52'}
            >
                <CardBody>
                    <div
                        className={'flex text-default-600'}
                    >
                        <Icon icon={"solar:sort-by-time-linear"} width={24} className={"text-default-500"}/>
                        <Spacer x={2}/>
                        <p>Working Hours</p>
                    </div>
                    <Spacer y={4}/>
                    <div className="flex flex-wrap items-center justify-center max-w-52">
                        {["monday", "friday", "tuesday", "thursday", "wednesday", "saturday", "sunday"].map((day, index) => {
                            //@ts-ignore
                            const workday = store.schedule[day];

                            const shortDay = getShortWeekday(day);
                            let displayText = `Closed`;
                            if (workday && (workday as WorkDay).isEnabled) {
                                const wd = workday as WorkDay;
                                const startHour = pad(wd.start.hour);
                                const startMinute = pad(wd.start.minute);
                                const endHour = pad(wd.end.hour);
                                const endMinute = pad(wd.end.minute);
                                displayText = `${startHour}:${startMinute} - ${endHour}:${endMinute}`;
                            }

                            const isSunday = day === "sunday";

                            return (
                                <div
                                    key={day}
                                    className={`${isSunday ? "ml-4 w-[40%] text-start" : `w-1/2 ${index % 2 == 0 ? 'text-start' : 'text-end'} `} flex flex-col`}
                                >
                                    <span className="text-sm font-medium text-default-600">
                                      {day.charAt(0).toUpperCase() + day.slice(1)}
                                    </span>
                                    <p className="text-default-500 text-xs font-light">
                                        {displayText}
                                    </p>
                                </div>
                            );
                        })}
                    </div>
                </CardBody>
            </Card>
        </>
    );
};