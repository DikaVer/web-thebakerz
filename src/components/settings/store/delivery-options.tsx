'use client';

import React, { useState } from "react";
import { Card, CardBody, CardHeader, addToast, Button, Switch } from "@heroui/react";
import { useTranslations } from "next-intl";
import { updateStoreDeliveryOptions } from "@/lib/actions/store";
import { useStore } from "@/components/providers/store-provider";

type DeliveryOption = 'pickup' | 'delivery' | 'multi';

interface DeliveryOptionsProps {
  className?: string;
}

const DeliveryOptions: React.FC<DeliveryOptionsProps> = ({ className }) => {
  const t = useTranslations("app/(return_page)/settings/components/delivery-options");
  const { store } = useStore();
  const [isPickupEnabled, setIsPickupEnabled] = useState(
    store?.deliveryOption === 'pickup' || store?.deliveryOption === 'multi'
  );
  const [isDeliveryEnabled, setIsDeliveryEnabled] = useState(
    store?.deliveryOption === 'delivery' || store?.deliveryOption === 'multi'
  );
  const [updatingOptions, setUpdatingOptions] = useState(false);

  if (!store) {
    return null;
  }

  const handleUpdateDeliveryOptions = async () => {
    try {
      setUpdatingOptions(true);
      
      // Determine the delivery option based on toggles
      let deliveryOption: DeliveryOption = 'pickup'; // Default
      if (isPickupEnabled && isDeliveryEnabled) {
        deliveryOption = 'multi';
      } else if (isDeliveryEnabled) {
        deliveryOption = 'delivery';
      } else if (isPickupEnabled) {
        deliveryOption = 'pickup';
      } else {
        // At least one option should be enabled, default to pickup if none selected
        setIsPickupEnabled(true);
        deliveryOption = 'pickup';
      }
      
      // Update the merchant's delivery options
      await updateStoreDeliveryOptions(store.id, deliveryOption);
      
      // Update the local store state to reflect the change
      if (store) {
        store.deliveryOption = deliveryOption;
      }
      
      addToast({
        title: t("optionsUpdateSuccess"),
        color: "success",
        shouldShowTimeoutProgress: true,
        timeout: 2000,
      });
    } catch (error) {
      addToast({
        title: t("optionsUpdateError"),
        color: "danger",
        shouldShowTimeoutProgress: true,
        timeout: 2000,
      });
    } finally {
      setUpdatingOptions(false);
    }
  };

  return (
    <Card shadow="none" className={`w-full max-w-2xl mx-auto ${className}`}>
      <CardHeader className="flex flex-col items-start">
        <h1>{t("deliveryOptions")}</h1>
        <p className="text-sm text-gray-600">{t("deliveryOptionsDescription")}</p>
      </CardHeader>
      <CardBody>
        <div className="space-y-4">
          <div className="flex flex-col gap-3">
            <div className="flex justify-between items-center">
              <div>
                <h4 className="text-md font-medium">{t("pickupOption")}</h4>
                <p className="text-xs text-gray-500">{t("pickupDescription")}</p>
              </div>
              <Switch 
                isDisabled={updatingOptions}
                isSelected={isPickupEnabled}
                onValueChange={setIsPickupEnabled}
              />
            </div>
            
            <div className="flex justify-between items-center">
              <div>
                <h4 className="text-md font-medium">{t("deliveryOption")}</h4>
                <p className="text-xs text-gray-500">{t("deliveryDescription")}</p>
              </div>
              <Switch 
                isDisabled={updatingOptions}
                isSelected={isDeliveryEnabled}
                onValueChange={setIsDeliveryEnabled}
              />
            </div>
          </div>
          
          <Button 
            onPress={handleUpdateDeliveryOptions}
            isDisabled={updatingOptions}
            className="w-full shadow-small"
            color="primary"
          >
            {updatingOptions ? t("updatingOptions") : t("updateDeliveryOptions")}
          </Button>
        </div>
      </CardBody>
    </Card>
  );
};

export default DeliveryOptions; 