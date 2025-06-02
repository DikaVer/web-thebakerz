import React from "react";
import { Button, ButtonGroup, Spinner, Skeleton } from "@heroui/react";
import { Icon } from "@iconify/react";
import { CalendarDateTime } from "@internationalized/date";
import { formatDate, SmartDatetimeInput } from "@/components/store/store-header/calendar/smart-calendar";
import { useTranslations } from "next-intl";

interface PickupTimeSelectionProps {
    buttonClassName?: string;
    schedule: any;
    minValue: () => any;
    selectedDate: any;
    onValueChange: (date: any) => void;
    isDateUpdating: boolean;
    isLoadingDate: boolean;
}

export const PickupTimeSelection: React.FC<PickupTimeSelectionProps> = ({
    buttonClassName,
    schedule,
    minValue,
    selectedDate,
    onValueChange,
    isDateUpdating,
    isLoadingDate
}) => {
    const t = useTranslations("app/(store)/components/store-subheader");

    return (
        <ButtonGroup
            fullWidth
            size="sm"
            radius="sm"
            className="text-grayText"
            aria-label="Pickup time selection"
        >
            <SmartDatetimeInput
                schedule={schedule}
                minValue={minValue()}
                value={selectedDate}
                onValueChange={onValueChange}
                placeholder={t("scheduleOrderTime")}
            >
                <Button
                    aria-label="Pickup time"
                    startContent={
                        <div className="flex items-center justify-center w-6 h-6">
                            {isDateUpdating || isLoadingDate ? <Spinner size="sm" color="current" /> : <Icon icon="solar:walking-round-linear" width={24}/>}
                        </div>
                    }
                    className={`${selectedDate instanceof CalendarDateTime ? `text-default-600 bg-background-secondary` : `border-2 border-primary ${buttonClassName}`} text-sm`}
                    onPress={() => {}}
                    isDisabled={isLoadingDate || isDateUpdating}
                >
                    <div className="w-full overflow-hidden text-ellipsis whitespace-nowrap">
                        {isLoadingDate ? (
                            <Skeleton className="h-4 w-32 rounded-lg" />
                        ) : (selectedDate instanceof CalendarDateTime) ? (
                            // `${t("pickUpAt")} ${formatDate(selectedDate)}`
                            `${formatDate(selectedDate)}`
                        ) : (
                            t("when")
                        )}
                    </div>
                </Button>
            </SmartDatetimeInput>
        </ButtonGroup>
    ); 
};