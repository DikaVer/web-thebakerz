import React from "react";
import { SelectTime } from "@/components/ui/select-time";
import { Button, cn} from "@heroui/react";
import { useDelivery } from "@/components/providers/delivery-provider";

import { DeliveryAddressButton } from "@/components/ui/select-time/delivery-address-button";
import { usePathname } from "next/navigation";
import { useMediaQuery } from "usehooks-ts";
import { Icon } from "@iconify/react/dist/iconify.js";
import { FilterButton } from "@/components/store/filter/FilterButton";

interface DeliveryNavbarProps {
    isVisible: boolean;
    level?: string;
    isComponent?: boolean;
}

export const DeliveryNavbar: React.FC<DeliveryNavbarProps> = ({
    isVisible,
    level = "top-14",
    isComponent = false
}) => {

    const { isDelivery } = useDelivery();
    const pathname = usePathname();
    const isSearchPage = pathname.includes("search");

    return (
        <div className={cn(
            "transition-all duration-300 bg-background w-full md:min-w-[500px]",
            "sticky top-14 z-30 px-4 py-2",
            isVisible ? `${level}` : `top-0`,
            isComponent && "flex"
        )}>
            <div className="flex flex-row w-full gap-4 max-w-lg">
                <div className={cn(
                    "w-1/3",
                    !isDelivery && "w-full",
                    isSearchPage && "hidden"
                )}>
                    <SelectTime />
                </div>
                <div className={cn(
                    "w-2/3"
                )}>
                    <div className={cn("flex space-x-2")}>
                        {!(!isDelivery && !isSearchPage) && <DeliveryAddressButton />}
                        <FilterButton />
                    </div>
                </div>
            </div>
        </div>
    );
}; 