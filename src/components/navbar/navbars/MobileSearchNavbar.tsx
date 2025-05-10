import { DeliveryAddressButton } from "@/components/ui/select-time/delivery-address-button";

import React from "react";
import { useDelivery } from "@/components/providers/delivery-provider";
import { useTranslations } from "next-intl";

export const MobileSearchNavbar: React.FC = () => {

    const { validationResult, address } = useDelivery();
    const t = useTranslations("app/(store)/components/store-subheader");

    return (
        <div className="flex flex-col w-full items-center px-2">
            <div className="flex flex-col w-full max-w-2xl gap-4 justify-start items-center">
                <DeliveryAddressButton/>
            </div>
        </div>
    );
}; 