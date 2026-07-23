/**
 * @fileoverview Order time selector switching between delivery and pickup.
 *
 * Exports SelectTime, which reads mode, schedule, and validation state from
 * the delivery and store providers, computes the earliest selectable time
 * from region or store minimum order times and product lead times (in the
 * Europe/Amsterdam timezone), and renders either DeliveryTimeSelection or
 * PickupTimeSelection accordingly.
 */
"use client";

import React, { useMemo } from "react";
import { Alert} from "@heroui/react";
import { now } from "@internationalized/date";
import { useTranslations } from "next-intl";
import { useDelivery } from "@/components/providers/delivery-provider";
import { useStore } from "@/components/providers/store-provider";
import { DeliveryTimeSelection } from "./select-time/delivery-time-selection";
import { PickupTimeSelection } from "./select-time/pickup-time-selection";
import { usePathname } from "next/navigation";
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
    const pathname = usePathname();
    const isCheckout = pathname.includes("checkout");

    const getDeliverySchedule = () => {
        if (validationResult.isInRange && validationResult.deliveryRegion?.deliverySchedule) {
            return validationResult.deliveryRegion.deliverySchedule;
        }
        return store.schedule;
    };

    const minValueTime = useMemo(() => {
        if (isDelivery && validationResult.deliveryRegion?.minOrderTime) {
            const minLeadTime = minLeadTimeProduct || 0;
            const final = validationResult.deliveryRegion?.minOrderTime > minLeadTime ? validationResult.deliveryRegion?.minOrderTime : minLeadTime;
            return now("Europe/Amsterdam").add({ minutes: final }); 
        } else {
            const minLeadTime = minLeadTimeProduct || 0;
            const final = store.minTimeOrder > minLeadTime ? store.minTimeOrder : minLeadTime;
            return now("Europe/Amsterdam").add({ minutes: final});
        }
    }, [isDelivery, validationResult.deliveryRegion?.minOrderTime, minLeadTimeProduct, store.minTimeOrder]);

    // Function that returns the memoized value
    const minValue = () => minValueTime;

    return isDelivery ? (
            <>
                {(validationResult?.isInRange && validationResult?.isValid) && (
                    <DeliveryTimeSelection
                        buttonClassName={isCheckout ? "bg-gradient-primary text-white" : ""}
                        schedule={getDeliverySchedule()}
                        minValue={minValue}
                        selectedDate={selectedDate}
                        onValueChange={handleDateChange}
                        isDateUpdating={isDateUpdating}
                        isLoadingDate={isLoadingDate}
                        isPostDelivery={validationResult?.deliveryRegion?.isPostDelivery || false}
                    />
                )}
            </>
    ) : (
        <PickupTimeSelection
            buttonClassName={isCheckout ? "bg-gradient-primary text-white" : ""}
            schedule={store.schedule}
            minValue={minValue}
            selectedDate={selectedDate}
            onValueChange={handleDateChange}
            isDateUpdating={isDateUpdating}
            isLoadingDate={isLoadingDate}
        />
    );
}
