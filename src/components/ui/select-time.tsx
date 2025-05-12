"use client";

import React from "react";
import { Alert} from "@heroui/react";
import { now } from "@internationalized/date";
import { useTranslations } from "next-intl";
import { useDelivery } from "@/components/providers/delivery-provider";
import { useStore } from "@/components/providers/store-provider";
import { DeliveryTimeSelection } from "./select-time/delivery-time-selection";
import { PickupTimeSelection } from "./select-time/pickup-time-selection";

export function SelectTime() {
    const t = useTranslations("app/(store)/components/store-subheader");
    const { 
        isDelivery,
        selectedDate,
        minLeadTimeProduct,
        isLoadingDate,
        isDateUpdating,
        handleDateChange,
        validationResult,
    } = useDelivery();

    const { store } = useStore();

    const getDeliverySchedule = () => {
        if (validationResult.isInRange && validationResult.deliveryRegion?.deliverySchedule) {
            return validationResult.deliveryRegion.deliverySchedule;
        }
        return store.schedule;
    };

    const minValue = () => {
        if (minLeadTimeProduct && minLeadTimeProduct > store.minTimeOrder) {
            return now("Europe/Amsterdam").add({ minutes: minLeadTimeProduct });
        } else {
            if (isDelivery) {
                return now("Europe/Amsterdam").add({ minutes: validationResult.deliveryRegion?.minOrderTime || 10080 }); 
            } else {
                return now("Europe/Amsterdam").add({ minutes: store.minTimeOrder || 10080 });
            }
        }
    };



    return isDelivery ? (
            <>
                
                {validationResult?.deliveryRegion?.isPostDelivery && (
                    <Alert  
                        key={"Delivery Options Alert"}
                        className={'bg-primary-400'}
                        classNames={{
                            description: 'text-white dark:text-default-500',
                            title: 'text-md'
                        }}
                        title={t("deliveryOptionsAlertTitle")}
                        description={t("deliveryOptionsAlertDescription", {store: store.ownerName})}
                        variant={"solid"}
                    />
                )}
                {(validationResult?.isInRange && validationResult?.isValid) && (
                    <DeliveryTimeSelection
                        schedule={getDeliverySchedule()}
                        minValue={minValue}
                        selectedDate={selectedDate}
                        onValueChange={handleDateChange}
                        isDateUpdating={isDateUpdating}
                        isLoadingDate={isLoadingDate}
                        isPostDelivery={validationResult?.deliveryRegion?.isPostDelivery || false}
                        t={t}
                    />
                )}
            </>
    ) : (
        <PickupTimeSelection
            schedule={store.schedule}
            minValue={minValue}
            selectedDate={selectedDate}
            onValueChange={handleDateChange}
            isDateUpdating={isDateUpdating}
            isLoadingDate={isLoadingDate}
            t={t}
        />
    );
}
