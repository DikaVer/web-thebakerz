import React from "react";
import { Button, ButtonGroup, Spinner, Skeleton } from "@heroui/react";
import { Icon } from "@iconify/react";
import { CalendarDateTime } from "@internationalized/date";
import { formatDate, SmartDatetimeInput } from "@/components/store/store-header/calendar/smart-calendar";
import { useTranslations } from "next-intl";

interface DeliveryTimeSelectionProps {
    buttonClassName?: string;
    schedule: any;
    minValue: () => any;
    selectedDate: any;
    onValueChange: (date: any) => void;
    isDateUpdating: boolean;
    isLoadingDate: boolean;
    isPostDelivery: boolean;
}

export const DeliveryTimeSelection: React.FC<DeliveryTimeSelectionProps> = ({
    buttonClassName,
    schedule,
    minValue,
    selectedDate,
    onValueChange,
    isDateUpdating,
    isLoadingDate,
    isPostDelivery
}) => {
    const t = useTranslations("app/(store)/components/store-subheader");

    return (
        <ButtonGroup
            aria-label="Delivery time selection"
            fullWidth
            size="sm"
            radius="sm"
            className="text-grayText"
        >
            <SmartDatetimeInput
                schedule={schedule}
                minValue={minValue()}
                value={selectedDate}
                onValueChange={onValueChange}
                isPostDelivery={isPostDelivery}
            >
                <Button
                    aria-label="Delivery time"
                    startContent={
                        <div className="flex items-center justify-center w-6 h-6">
                            {isDateUpdating || isLoadingDate ? 
                                <Spinner size="sm" color="current" /> : 
                                <Icon icon="solar:scooter-linear" width={24} />
                            }
                        </div>
                    }
                    className={`${selectedDate instanceof CalendarDateTime ? `text-default-600 bg-background-secondary` : `border-2 border-primary ${buttonClassName}`} text-sm`}
                    onPress={() => {}}
                    isDisabled={isDateUpdating || isLoadingDate}
                >
                    <div className="w-full overflow-hidden text-ellipsis whitespace-nowrap">
                        {isLoadingDate ? (
                            <Skeleton className="h-4 w-32 rounded-lg" /> 
                        ) : selectedDate instanceof CalendarDateTime ? (
                        // `${t("deliverAt")} ${formatDate(selectedDate, isPostDelivery)}`
                        `${formatDate(selectedDate, isPostDelivery)}`
                        ) : (
                                t("when")
                            )}
                    </div>
                </Button>
            </SmartDatetimeInput>
        </ButtonGroup>
    ); 
};