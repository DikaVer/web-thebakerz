import React from "react";
import CartButton from "@/components/cart/cart-button";
import { SelectTime } from "@/components/ui/select-time";

export const MobileNavbar: React.FC = () => {
    return (
        <div className="flex flex-col w-full justify-around items-center px-2">
            <CartButton 
                isMobileNavbar={true}
            />
            <SelectTime />
        </div>
    );
}; 