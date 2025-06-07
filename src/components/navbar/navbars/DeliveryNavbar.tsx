import React from "react";
import { SelectTime } from "@/components/ui/select-time";
import { ButtonGroup, cn} from "@heroui/react";
import { useDelivery } from "@/components/providers/delivery-provider";

import { DeliveryAddressButton } from "@/components/ui/select-time/delivery-address-button";
import { usePathname } from "next/navigation";
import { Icon } from "@iconify/react/dist/iconify.js";
import { useCart } from "@/components/providers/cart-provider";
import { StoreData } from "@/lib/actions/store";
import { useTranslations } from "next-intl";
import { useMediaQuery } from "usehooks-ts";
import { FilterButtonWithHint } from "@/components/filter/FilterButtonWithHint";

interface DeliveryNavbarProps {
    isVisible: boolean;
    level?: string;
    isComponent?: boolean;
    store?: StoreData;
}

export const DeliveryNavbar: React.FC<DeliveryNavbarProps> = ({
    isVisible,
    level = "top-14",
    isComponent = false,
    store
}) => {

    const t = useTranslations("app/(store)/components/store-header");
    const isHideDelivery = useMediaQuery(store ? "(max-width: 1200px)" : "(max-width: 948px)");

    const { isDelivery, toggleDeliveryMode, isTogglingDelivery } = useDelivery();
    const { setCurrentCartType } = store ? useCart() : { setCurrentCartType: () => {} };
    const pathname = usePathname();
    const isSearchPage = pathname.includes("search");
    let deliveryOption = store?.deliveryOption || "undefined";

    if (deliveryOption === "undefined") {
        deliveryOption = "multi";
    }

    return (
        <div className={cn(
            "transition-all duration-300 bg-background w-full md:min-w-[500px] justify-center items-center gap-2 ",
            "sticky top-14 z-30 px-4 py-2",
            isVisible ? `${level}` : `-top-14`,
            isComponent && "flex"
        )}>
            {/* Toggle Delivery Button */}
            <div className={cn(
                "flex items-center justify-start flex-shrink-0",
                isHideDelivery && "pb-2"
            )}>
                    <div className="relative rounded-xl px-2 py-1 bg-background min-w-[160px]">
                        <ButtonGroup
                            aria-label="Delivery options"
                            className="relative z-10 gap-2 overflow-hidden"
                            isDisabled={isTogglingDelivery}
                        >
                             {(deliveryOption === "delivery" || deliveryOption === "multi") && (
                                <button
                                    onClick={() => {
                                        setCurrentCartType('delivery');
                                        toggleDeliveryMode(true);
                                    }}
                                    className={cn(
                                        "transition-all duration-300 data-[hover=true]:bg-transparent px-2 py-1",
                                        isDelivery ? "text-foreground-secondary font-medium" : "text-default-500 font-normal",
                                        isTogglingDelivery ? "opacity-50" : "opacity-100"
                                    )}
                                >
                                    <div className="flex items-center gap-2">
                                        <div className="w-5 h-5 flex items-center justify-center">
                                            <Icon
                                                icon="solar:scooter-bold"
                                                width={20}
                                                height={20}
                                                className={cn(
                                                    "transition-all duration-300",
                                                    isDelivery ? "text-primary" : "text-default-500"
                                                )}
                                            />
                                        </div>
                                        <span className={cn("text-sm whitespace-nowrap", isDelivery ? "text-foreground-secondary" : "text-default-500")}>{t('delivery')}</span>
                                    </div>
                                </button>
                            )}
                            {(deliveryOption === "pickup" || deliveryOption === 'multi') && (
                                <button
                                    onClick={() => {
                                        setCurrentCartType('pickup');
                                        toggleDeliveryMode(false);
                                    }}
                                    className={cn(
                                        "transition-all duration-300 data-[hover=true]:bg-transparent px-2 py-1",
                                        !isDelivery ? "text-foreground-secondary font-medium" : "text-default-500 font-normal",
                                        isTogglingDelivery ? "opacity-50" : "opacity-100"
                                    )}
                                >
                                    <div className="flex items-center gap-2">
                                        <div className="w-5 h-5 flex items-center justify-center">
                                            <Icon
                                                icon="solar:shop-2-bold"
                                                width={20}
                                                height={20}
                                                className={cn(
                                                    "transition-all duration-300",
                                                    !isDelivery ? "text-primary" : "text-default-500"
                                                )}
                                            />
                                        </div>
                                        <span className={cn("text-sm whitespace-nowrap", isDelivery ? "text-default-500" : "text-foreground-secondary")}>{t('pickup')}</span>
                                    </div>
                                </button>
                            )}
                        </ButtonGroup>
                        <div
                            className={cn(
                                "absolute top-0.5 bottom-0.5 rounded-small bg-white dark:bg-default-700 transition-all duration-300 border-2 border-foreground-secondary",
                                !isDelivery ? "translate-x-[calc(100%)]" : "translate-x-[1px]",
                                (deliveryOption === "multi") ? "w-[calc(50%)]" : "w-[calc(100%)]",
                                (deliveryOption === "pickup") && "translate-x-[1px]"
                            )}
                            style={{
                                left: deliveryOption === "pickup" ? "1px" : "1px"
                            }}
                        />
                    </div>
                </div>
            <div className="flex flex-row w-full gap-4 max-w-lg">
                <div className={cn(
                    "w-1/3",
                    !isDelivery && "w-full",
                    isSearchPage && "hidden"
                )}>
                    <SelectTime />
                </div>
                <div className={cn(
                    "w-2/3",
                    isSearchPage && "w-full"
                )}>
                    <div className={cn("flex space-x-2")}>
                        {!(!isDelivery && !isSearchPage) && <DeliveryAddressButton />}
                        <FilterButtonWithHint />
                    </div>
                </div>
            </div>
        </div>
    );
}; 