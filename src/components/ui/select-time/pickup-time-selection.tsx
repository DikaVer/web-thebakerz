import React from "react";
import { Button, ButtonGroup, Spinner, Skeleton } from "@heroui/react";
import { Icon } from "@iconify/react";
import { CalendarDateTime } from "@internationalized/date";
import { formatDate, SmartDatetimeInput } from "@/components/store/store-header/calendar/smart-calendar";

interface PickupTimeSelectionProps {
    schedule: any;
    minValue: () => any;
    selectedDate: any;
    onValueChange: (date: any) => void;
    isDateUpdating: boolean;
    isLoadingDate: boolean;
    t: (key: string) => string;
}

export const PickupTimeSelection: React.FC<PickupTimeSelectionProps> = ({
    schedule,
    minValue,
    selectedDate,
    onValueChange,
    isDateUpdating,
    isLoadingDate,
    t
}) => (
    <ButtonGroup
        fullWidth
        size="sm"
        radius="md"
        className="text-grayText"
    >
        <SmartDatetimeInput
            schedule={schedule}
            minValue={minValue()}
            value={selectedDate}
            onValueChange={onValueChange}
            placeholder={t("scheduleOrderTime")}
        >
            <Button
                startContent={
                    <div className="flex items-center justify-center w-6 h-6">
                        {isDateUpdating || isLoadingDate ? <Spinner size="sm" color="current" /> : <Icon icon="solar:walking-round-linear" width={24}/>}
                    </div>
                }
                className={`${selectedDate instanceof CalendarDateTime ? 'text-default-600 bg-background-secondary' : 'border-2 border-primary'} text-sm`}
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