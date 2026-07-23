/**
 * @fileoverview Fixed bottom navigation bar shown to customers on store pages.
 *
 * Exports the MobileNavbar component, which displays the cart button when
 * the customer's address is within delivery range (or when in pickup mode),
 * a warning alert when the address is out of range, and an informational
 * alert for postal delivery regions.
 */
import React from "react";
import CartButton from "@/components/cart/cart-button";
import { SelectTime } from "@/components/ui/select-time";
import { Spacer } from "@heroui/react";
import { Alert } from "@heroui/react";
import { useDelivery } from "@/components/providers/delivery-provider";
import { useTranslations } from "next-intl";
import { DeliveryAddressButton } from "@/components/ui/select-time/delivery-address-button";
import { useStore } from "@/components/providers/store-provider";
export const MobileNavbar: React.FC = () => {

    const { validationResult, address, isDelivery } = useDelivery();
    const t = useTranslations("app/(store)/components/store-subheader");
    const { store } = useStore();

    return (
        <div className="flex flex-col w-full items-center px-2">
            <div className="flex flex-col w-full max-w-2xl gap-4 justify-start items-center">
                <div className={'flex flex-row w-full gap-4'}>
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
                {(validationResult?.deliveryRegion?.isPostDelivery && validationResult.isInRange && address && isDelivery) && (
                    <div className="flex flex-col w-full h-full justify-between">
                    <Alert  
                        key={"Delivery Options Alert"}
                        className={'bg-primary-400'}
                        classNames={{
                            description: 'text-white dark:text-default-500',
                            title: 'text-md'
                        }}
                        title={t("deliveryOptionsAlertTitle")}
                        description={t("deliveryOptionsAlertDescription", {store: store.ownerName ?? ''})}
                        variant={"solid"}
                        />
                    </div>
                )}
            </div>
        </div>
    );
}; 