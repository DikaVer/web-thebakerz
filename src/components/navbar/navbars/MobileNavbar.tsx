import React from "react";
import CartButton from "@/components/cart/cart-button";
import { SelectTime } from "@/components/ui/select-time";

export const MobileNavbar: React.FC = () => {
    return (
        <div className="flex flex-col w-full items-center px-2">
            <div className="flex flex-col w-full max-w-2xl justify-around items-center">
                <CartButton 
                    isMobileNavbar={true}
                />
                <SelectTime />
            </div>
        </div>
    );
}; 