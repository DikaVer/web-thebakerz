import React from "react";
import CartButton from "@/components/cart/cart-button";
import { SelectTime } from "@/components/ui/select-time";
import { Spacer } from "@heroui/react";
import { Alert } from "@heroui/react";
import { useDelivery } from "@/components/providers/delivery-provider";
import { useTranslations } from "next-intl";
import { DeliveryAddressButton } from "@/components/ui/select-time/delivery-address-button";

export const MobileNavbar: React.FC = () => {

    const { validationResult, address, isDelivery } = useDelivery();
    const t = useTranslations("app/(store)/components/store-subheader");

    return (
        <div className="flex flex-col w-full items-center px-2">
            <div className="flex flex-col w-full max-w-2xl gap-4 justify-start items-center">
                <div className={'flex flex-row w-full gap-4'}>
                    {isDelivery && (
                        <DeliveryAddressButton/>
                    )}
                    {((validationResult.isInRange && address) || !isDelivery) && (
                        <CartButton
                            isMobileNavbar={true}
                        />
                    )}
                </div>
            {(!validationResult.isInRange && address && isDelivery) && (
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