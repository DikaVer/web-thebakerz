import React from "react";
import { Button, ButtonGroup, Spinner, Skeleton } from "@heroui/react";
import { Icon } from "@iconify/react";
import { CalendarDateTime } from "@internationalized/date";
import { formatDate, SmartDatetimeInput } from "@/components/store/store-header/calendar/smart-calendar";

interface DeliveryTimeSelectionProps {
    schedule: any;
    minValue: () => any;
    selectedDate: any;
    onValueChange: (date: any) => void;
    isDateUpdating: boolean;
    isLoadingDate: boolean;
    isPostDelivery: boolean;
    t: (key: string) => string;
}

export const DeliveryTimeSelection: React.FC<DeliveryTimeSelectionProps> = ({
    schedule,
    minValue,
    selectedDate,
    onValueChange,
    isDateUpdating,
    isLoadingDate,
    isPostDelivery,
    t
}) => (
    <ButtonGroup
        fullWidth
        size="sm"
        radius="md"
        className="text-grayText mt-4"
    >
        <SmartDatetimeInput
            schedule={schedule}
            minValue={minValue()}
            value={selectedDate}
            onValueChange={onValueChange}
            placeholder={t("scheduleDeliveryTime")}
            isPostDelivery={isPostDelivery}
        >
            <Button
                startContent={
                    isDateUpdating || isLoadingDate ? 
                    <Spinner size="sm" color="current" /> : 
                    <Icon icon="solar:scooter-linear" width={24} />
                }
                radius="md"
                variant={selectedDate instanceof CalendarDateTime ? "bordered" : "solid"}
                className={`${
                    selectedDate instanceof CalendarDateTime ? "text-default-600" : "text-white bg-gradient-primary"
                } text-sm transition-all duration-300`}
                onPress={() => {}}
                isDisabled={isDateUpdating || isLoadingDate}
            >
                {isLoadingDate ? (
                    <Skeleton className="h-4 w-32 rounded-lg" /> 
                ) : selectedDate instanceof CalendarDateTime ? (
                    `${t("deliverAt")} ${formatDate(selectedDate, isPostDelivery)}`
                ) : (
                    isPostDelivery ? t("selectDeliveryDate") : t("selectDeliveryTime")
                )}
            </Button>
        </SmartDatetimeInput>
    </ButtonGroup>
); 