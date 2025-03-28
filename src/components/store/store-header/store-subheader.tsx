"use client";

import React from "react";
import { StoreSubHeaderPickUp } from "@/components/store/store-header/subheader/store-subheader-pickup";
import { StoreSubHeaderDelivery } from "@/components/store/store-header/subheader/store-subheader-delivery";
import { getDeliveryMode } from "@/lib/delivery-cookie";
import { CalendarDateTime, CalendarDate } from "@internationalized/date";

interface StoreSubHeaderProps {
    dateParam: string | null;
    timeParam: string | null;
    setSelectedDateGlobal?: (date: CalendarDateTime | CalendarDate | undefined) => void;
    isDelivery: boolean;
}

export function StoreSubHeader({ dateParam, timeParam, setSelectedDateGlobal, isDelivery }: StoreSubHeaderProps) {
    return isDelivery ? (
        <StoreSubHeaderDelivery
            dateParam={dateParam}
            timeParam={timeParam}
            setSelectedDateGlobal={setSelectedDateGlobal}
        />
    ) : (
        <StoreSubHeaderPickUp
            dateParam={dateParam}
            timeParam={timeParam}
            setSelectedDateGlobal={setSelectedDateGlobal}
        />
    );
}