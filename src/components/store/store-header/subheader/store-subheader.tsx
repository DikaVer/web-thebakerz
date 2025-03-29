import React, { useEffect, useRef } from "react";
import { StoreSubHeaderPickUp } from "./store-subheader-pickup";
import { StoreSubHeaderDelivery } from "./store-subheader-delivery";

interface StoreSubHeaderProps {
    isDelivery: boolean;
    onLoadingStateChange?: (isLoaded: boolean) => void;
}

export function StoreSubHeader({ isDelivery, onLoadingStateChange }: StoreSubHeaderProps) {
    const prevDeliveryMode = useRef(isDelivery);
    
    // Signal to parent component that new subheader is initially loading
    // Only reset the loading state when the delivery mode changes
    useEffect(() => {
        if (onLoadingStateChange && prevDeliveryMode.current !== isDelivery) {
            prevDeliveryMode.current = isDelivery;
            onLoadingStateChange(false);
        }
    }, [isDelivery, onLoadingStateChange]);
    
    // Render the appropriate subheader based on delivery status
    return (
        <>
            {isDelivery ? (
                <StoreSubHeaderDelivery onLoadingStateChange={onLoadingStateChange} />
            ) : (
                <StoreSubHeaderPickUp onLoadingStateChange={onLoadingStateChange} />
            )}
        </>
    );
} 