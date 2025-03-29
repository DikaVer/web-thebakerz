"use client";

import React from "react";
import { StoreSubHeaderPickUp } from "@/components/store/store-header/subheader/store-subheader-pickup";
import { StoreSubHeaderDelivery } from "@/components/store/store-header/subheader/store-subheader-delivery";
import { getDeliveryMode } from "@/lib/delivery-cookie";
import { CalendarDateTime, CalendarDate } from "@internationalized/date";

interface StoreSubHeaderProps {
    isDelivery: boolean;
    onLoadingStateChange?: (loaded: boolean) => void;
    setSelectedGlobalDate?: (date: CalendarDateTime | CalendarDate | undefined) => void;
}

export function StoreSubHeader({ isDelivery, onLoadingStateChange, setSelectedGlobalDate }: StoreSubHeaderProps) {
    return isDelivery ? (
        <StoreSubHeaderDelivery setSelectedGlobalDate={setSelectedGlobalDate} onLoadingStateChange={onLoadingStateChange}/>
    ) : (
        <StoreSubHeaderPickUp  onLoadingStateChange={onLoadingStateChange}/>
    );
}