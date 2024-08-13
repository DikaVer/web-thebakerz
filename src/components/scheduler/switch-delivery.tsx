import React, { useState } from "react";

export const SwitchDelivery: React.FC = () => {
    const [isPickup, setIsPickup] = useState(true);

    const togglePosition = () => {
        setIsPickup(!isPickup);
    };

    return (
        <div
            className={"grid grid-cols-2 items-center rounded-full w-80 h-12 bg-grayBg transition duration-500 hover:bg-gray-200 cursor-pointer"}
            onClick={togglePosition}
        >
            <p className="text-black text-center z-10">Pickup</p>
            <div
                className={`absolute z-0 grid grid-rows-1 items-center rounded-full h-9 w-39 bg-grayComp transition-transform duration-500  ${isPickup ? "translate-x-2" : "translate-x-full"}`}
            >
            </div>
            <p className="text-black text-center z-10">Delivery</p>
        </div>
    );
};