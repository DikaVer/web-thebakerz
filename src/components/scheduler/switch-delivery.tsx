import React, { useState } from "react";
import {CheckoutDataAuthField} from "@/lib/definitions";
import {useDebouncedCallback} from "use-debounce";

interface SwitchDeliveryProps {
    toggleIsPickUp: () => void;
    isPickup: boolean;
}

export const SwitchDelivery: React.FC<SwitchDeliveryProps> = ({toggleIsPickUp, isPickup}) => {
    const [isDebouncing, setIsDebouncing] = useState(false); // Track debounce state


    // Debounce the switch handler (currently not used for later use)
    const handleSwitch = useDebouncedCallback(() => {
        toggleIsPickUp();
        setIsDebouncing(false); // Re-enable clicks after debounce
    }, 200); // Debounce for 1 second

    const onSwitchClick = () => {
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
            <p className="text-black text-center z-10">Pickup</p>
            <div
                className={`absolute z-0 grid grid-rows-1 items-center rounded-full h-9 w-39 bg-grayComp transition-transform duration-500 ${isPickup ? "translate-x-2" : "translate-x-full"}`}
            >
            </div>
            <p className="text-black text-center z-10">Delivery</p>
        </div>
    );
};