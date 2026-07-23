/**
 * @fileoverview Render helpers for displaying store and delivery working
 * hours.
 *
 * Exports renderScheduleDisplay (a per-weekday open/closed schedule list),
 * renderWorkingHoursDropdown and renderCalendarTopContent (a dropdown button
 * showing store or delivery-region hours depending on delivery mode), and
 * renderCalendarContent, which picks the right schedule or prompt based on
 * address validation state, post-delivery regions, and pickup vs delivery
 * mode.
 */
'use client';

import {Button, Card, CardBody, Dropdown, DropdownMenu, DropdownTrigger, Tooltip, Spinner, Chip} from "@heroui/react";
import {Icon} from "@iconify/react";
import {WorkDay, WorkHours} from "@/lib/actions/calendar-actions";
import {useStore} from "@/components/providers/store-provider";
import {useMediaQuery} from "usehooks-ts";
import {StoreData} from "@/lib/actions/store";
import {useTranslations} from "next-intl";
import { useDelivery } from '@/components/providers/delivery-provider';
import { MerchantDeliveryRegion } from '@/lib/actions/delivery-actions';

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

// --- Helper to render the actual schedule list ---
export const renderScheduleDisplay = (
    scheduleData: StoreData['schedule'] | WorkHours | undefined,
    translations: any // Accept translations function as parameter
) => {
    if (!scheduleData) {
        return (
            <div className="w-full flex justify-center items-center py-2">
                <div className="text-default-500 text-center text-sm">{translations("noScheduleAvailable")}</div>
            </div>
        );
    }

    // Define the order of days
    const daysOrder = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"];

    // Check if scheduleData has keys corresponding to daysOrder
    const hasDayKeys = daysOrder.some(day => scheduleData.hasOwnProperty(day));

    if (!hasDayKeys) {
        console.warn("Schedule data does not contain expected day keys:", scheduleData);
        return (
            <div className="w-full flex justify-center items-center py-2">
                <div className="text-default-500 text-center text-sm">{translations("scheduleFormatError")}</div>
            </div>
        );
    }

    return (
        <div className="flex flex-col w-full py-1">
            {daysOrder.map((day, index) => {
                // Type assertion to handle different schedule types
                const workday = (scheduleData as any)[day] as WorkDay | undefined;

                let displayText = translations("closed");
                let isOpen = false;
                
                if (workday && workday.isEnabled) {
                    const startHour = pad(workday.start.hour);
                    const startMinute = pad(workday.start.minute);
                    const endHour = pad(workday.end.hour);
                    const endMinute = pad(workday.end.minute);
                    displayText = `${startHour}:${startMinute} - ${endHour}:${endMinute}`;
                    isOpen = true;
                } else if (workday && !workday.isEnabled) {
                    displayText = translations("closed");
                } else if (!workday) {
                    // Handle cases where a day might be missing in the data
                    displayText = translations("noInfo");
                }

                return (
                    <div
                        key={day}
                        className={`flex justify-between items-center py-1.5 ${index !== daysOrder.length - 1 ? 'border-b border-default-200/50' : ''}`}
                    >
                        <span className="text-sm font-medium text-default-700 capitalize">
                            {translations(day)}
                        </span>
                        {isOpen ? (
                            <p className="text-foreground text-xs font-medium bg-default-200 px-2 py-1 rounded-md">
                                {displayText}
                            </p>
                        ) : (
                            <Chip 
                                color="default" 
                                variant="flat" 
                                size="sm" 
                                className="text-xs font-medium"
                            >
                                {displayText}
                            </Chip>
                        )}
                    </div>
                );
            })}
        </div>
    );
};

export const renderCalendarTopContent = () => {
    const { store } = useStore();
    const isSmall = useMediaQuery("(max-width: 767px)");
    const t = useTranslations("app/(store)/components/working-hours");


    if (!store?.schedule) {
        return (
            <div className="w-full mx-2 max-w-52 text-default-500 text-center py-2 bg-default-50 rounded-md">
                {t("noScheduleAvailable")}
            </div>
        );
    }

    return renderWorkingHoursDropdown({ store });
};

export const renderWorkingHoursDropdown = ({store} : {store: StoreData}) => {
    const { isDelivery, validationResult } = useDelivery();
    const t = useTranslations("app/(store)/components/working-hours");

    // Early return if no schedule
    if (!store?.schedule) {
        return (
            <Button
                aria-label="Working hours"
                size={"sm"}
                variant="bordered"
                radius={'md'}
                className={'text-default-600 bg-gradient-card'}
                isDisabled
            >
                <div className={'flex items-center gap-x-2 w-full'}>
                    <Icon icon={"solar:sort-by-time-linear"} width={24} className={"text-default-500"}/>
                    <p className={'w-[90%] truncate'}>{t("workingHours")}</p>
                </div>
            </Button>
        );
    }

    // Decide which schedule to show based on delivery mode
    const scheduleToShow = isDelivery && validationResult.isValid && validationResult.isInRange 
        && validationResult.deliveryRegion?.deliverySchedule
        ? validationResult.deliveryRegion.deliverySchedule
        : store.schedule;

    return (
        <Dropdown
            placement={"top"}
            isDismissable={true}
            backdrop={"blur"}
        >
            <DropdownTrigger>
                <Button
                    aria-label="Working hours"
                    size={"sm"}
                    variant="bordered"
                    radius={'md'}
                    className={'text-default-600 hover:bg-default-100 bg-gradient-card transition-all'}
                    startContent={<Icon icon={"solar:sort-by-time-linear"} width={20} className={"text-default-500"}/>}
                >
                    <p className={'truncate'}>
                        {t(isDelivery ? "deliveryHours" : "workingHours")}
                    </p>
                </Button>
            </DropdownTrigger>
            <DropdownMenu
                aria-label={t(isDelivery ? "deliveryHoursAriaLabel" : "workingHoursAriaLabel")}
                className="p-3 min-w-[280px]"
            >
                <Card shadow="none" className="border-none shadow-none">
                    <CardBody className="p-0">
                        <h3 className="text-center text-default-700 font-medium mb-2 pb-2 border-b border-default-200/50">
                            {t(isDelivery ? "deliveryHoursTitle" : "workingHoursTitle")}
                        </h3>
                        {renderScheduleDisplay(scheduleToShow, t)}
                    </CardBody>
                </Card>
            </DropdownMenu>
        </Dropdown>
    );
}

export const renderCalendarContent = () => {
    const { store } = useStore();
    const {
        isDelivery,
        validationResult,
        isValidating,
    } = useDelivery();
    const t = useTranslations("app/(store)/components/working-hours");

    // Loading state
    if (isDelivery && (isValidating)) {
        return (
            <div className="w-full flex justify-center items-center py-4">
                <Spinner size="sm" color="current" />
                <span className="ml-2 text-sm text-default-500">{t("checkingAddress")}</span>
            </div>
        );
    }

    // For delivery mode
    if (isDelivery) {
        // Address not entered or invalid
        if (!validationResult.isValid) {
            return (
                <div className="w-full text-warning-600 text-center text-sm bg-warning-50 py-2 px-3 rounded-md">
                    {t("enterAddressPrompt")}
                </div>
            );
        }

        if (validationResult?.deliveryRegion?.isPostDelivery) {
            return (
                <div className="w-full text-foreground text-center text-sm bg-background-secondary py-2 px-3 rounded-md">
                    {t("postDeliveryAvailable")}
                </div>
            );
        }
        
        // Address is out of delivery range
        if (!validationResult.isInRange) {
            const message = validationResult.message || t("addressOutOfRange");
            return (
                <div className="w-full text-warning-600 text-center text-sm bg-warning-50 py-2 px-3 rounded-md">
                    {message}
                </div>
            );
        }
        
        // Address is valid and in range, but no deliveryRegion
        if (validationResult.isValid && validationResult.isInRange) {
            // FIX: Handle case where validationResult doesn't have deliveryRegion
            // This happens when the address is valid but no region data was fetched yet
            if (!validationResult.deliveryRegion) {
                return (
                    <div className="w-full flex flex-col gap-2 items-center py-3">
                        {renderScheduleDisplay(store?.schedule, t)}
                    </div>
                );
            }
            
            // No delivery schedule for this region
            if (!validationResult.deliveryRegion.deliverySchedule) {
                console.warn("Delivery schedule missing for delivery region:", validationResult.deliveryRegion.name);
                return (
                    <div className="w-full flex flex-col gap-2 items-center py-3">
                        {renderScheduleDisplay(store?.schedule, t)}
                    </div>
                );
            }
            
            // Show the delivery schedule
            return (
                <div className="w-full py-1">
                    {renderScheduleDisplay(validationResult.deliveryRegion.deliverySchedule, t)}
                </div>
            );
        }
        
        // Fallback (unlikely to reach here)
        return (
            <div className="w-full text-default-500 text-center text-sm bg-default-50 py-2 px-3 rounded-md">
                {t("scheduleUnavailable")}
            </div>
        );
    } else {
        // For pickup mode, show store schedule
        return (
            <div className="w-full py-1">
                {renderScheduleDisplay(store?.schedule, t)}
            </div>
        );
    }
};