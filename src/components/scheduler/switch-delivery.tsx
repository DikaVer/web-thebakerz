import React, { useState } from "react";
import {useDebouncedCallback} from "use-debounce";
import {CheckoutData} from "@/lib/definitions";

interface SwitchDeliveryProps {
    checkoutData: CheckoutData,
    updateCheckoutData: () => void;
    onSwitchClick?: () => void;
    isPickup: boolean;
}

export const SwitchDelivery: React.FC<SwitchDeliveryProps> = ({isPickup, checkoutData, updateCheckoutData, onSwitchClick}) => {
    const [isDebouncing, setIsDebouncing] = useState(false); // Track debounce state

    // const toggleIsPickUp = () => {
    //     // Update the pickUp status in checkoutData
    //     localStorage.setItem('deliveryMode', checkoutData.deliveryMode === "PICKUP" ? 'DELIVERY' : 'PICKUP');
    //     updateCheckoutData();
    //
    //     // Call the onSwitchClick handler if it exists
    //     onSwitchClick && onSwitchClick();
    //     setIsDebouncing(false);
    // };


    // Debounce the switch handler (currently not used for later use)
    const handleSwitch = useDebouncedCallback(() => {
        // Update the pickUp status in checkoutData
        localStorage.setItem('deliveryMode', checkoutData.deliveryMode === "PICKUP" ? 'DELIVERY' : 'PICKUP');
        updateCheckoutData();

        // Call the onSwitchClick handler if it exists
        onSwitchClick && onSwitchClick();
        setIsDebouncing(false);
    }, 300); // Debounce for 1 second

    const toggleIsPickUp = () => {
        if (!isDebouncing) {
            setIsDebouncing(true); // Disable clicks during debounce
            handleSwitch(); // Call debounced function
        }
    };


    return (
        <div
            className={`relative grid grid-cols-2 items-center rounded-full w-80 h-12 bg-grayBg transition-colors duration-500 ${isDebouncing ? 'opacity-50 pointer-events-none' : 'cursor-pointer'}`}
            onClick={toggleIsPickUp} // Call the handler with debounce
        >
            <p className={`${isPickup ? 'font-medium' : ''} text-center z-10`}>Pickup</p>
            <div
                className={`absolute z-0 grid grid-rows-1 items-center rounded-full h-9 w-39 bg-grayComp transition-transform duration-500 ${isPickup ? "translate-x-2" : "translate-x-full"}`}
            >
            </div>
            <p className={`${isPickup ? '' : 'font-medium'} text-center z-10`}>Delivery</p>
        </div>
    );
};