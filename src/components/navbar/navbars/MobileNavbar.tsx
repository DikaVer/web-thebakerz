import React from "react";
import CartButton from "@/components/cart/cart-button";
import { SelectTime } from "@/components/ui/select-time";
import { Spacer } from "@heroui/react";
import { Alert } from "@heroui/react";
import { useDelivery } from "@/components/providers/delivery-provider";
import { useTranslations } from "next-intl";
import { DeliveryAddressButton } from "@/components/ui/select-time/delivery-address-button";

export const MobileNavbar: React.FC = () => {

    const { validationResult, address } = useDelivery();
    const t = useTranslations("app/(store)/components/store-subheader");

    return (
        <div className="flex flex-col w-full items-center px-2">
            <div className="flex flex-col w-full max-w-2xl gap-4 justify-start items-center">
            {(validationResult.isInRange && address) && (
                <CartButton 
                    isMobileNavbar={true}
                />
            )}
             <DeliveryAddressButton/>
            {(!validationResult.isInRange && address) && (
                <div className="flex flex-col w-full h-full justify-between">
                    <Alert 
                        color="danger"
                    >
                        <p className="text-xl">{t('address_not_in_delivery_range')}</p>
                    </Alert>
                </div>
            )}
                <SelectTime />
            </div>
        </div>
    );
}; 