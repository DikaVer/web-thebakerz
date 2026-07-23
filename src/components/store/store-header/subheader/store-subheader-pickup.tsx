/**
 * @fileoverview Subheader content shown when the store is in pickup mode.
 *
 * Exports the StoreSubHeaderPickUp client component, a thin wrapper that
 * reads the current store from the store provider and renders PickupInfo
 * with it.
 */
"use client";

import React from "react";
import {
    Spacer,
} from "@heroui/react";
import { useStore } from "@/components/providers/store-provider";
import { useTranslations } from "next-intl";
import PickupInfo from "./pickup-info";


interface StoreSubHeaderPickUpProps {
}

export function StoreSubHeaderPickUp({ }: StoreSubHeaderPickUpProps) {
    const { store } = useStore();
    const t = useTranslations("app/(store)/components/store-subheader");
    
    return (
        <div className="flex flex-col w-full">
            <Spacer y={4}/>
            {/* Display store pickup info */}
            <PickupInfo 
                store={store} 
            />
        </div>
    );
}