"use client";

import React, { useEffect } from "react";
import {
    Button,
    ButtonGroup,
    Spacer,
    Skeleton,
    Spinner
} from "@heroui/react";
import { Icon } from "@iconify/react";
import { CalendarDateTime, CalendarDate, now } from "@internationalized/date";
import { useStore } from "@/components/providers/store-provider";
import { formatDate, SmartDatetimeInput } from "@/components/store/store-header/calendar/smart-calendar";
import { useTranslations } from "next-intl";
import PickupInfo from "./pickup-info";
import { useDelivery } from "@/components/providers/delivery-provider";
import { useSession } from "@/components/providers/session-provider";

interface StoreSubHeaderPickUpProps {
}

export function StoreSubHeaderPickUp({ }: StoreSubHeaderPickUpProps) {
    const { store } = useStore();
    const t = useTranslations("app/(store)/components/store-subheader");
    
    const {
        selectedDate,
        minLeadTimeProduct,
        isLoadingDate,
        isDateUpdating,
        handleDateChange,
        setMapLoaded
    } = useDelivery();


    const minValue = () => {
        if (minLeadTimeProduct && minLeadTimeProduct > store.minTimeOrder) {
            return now("Europe/Amsterdam").add({ minutes: minLeadTimeProduct });
        } else {
            return now("Europe/Amsterdam").add({ minutes: store.minTimeOrder || 10080 });
        }
    }

    return (
        <div className="flex flex-col w-full">
            <Spacer y={4}/>
            {/* Display store pickup info */}
            <PickupInfo 
                store={store} 
                onMapLoaded={() => setMapLoaded(true)}
            />
            
            {/* Pickup time selector */}
        
        
        </div>
    );
}