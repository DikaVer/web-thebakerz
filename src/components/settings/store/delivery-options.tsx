'use client';

import React, { useState, useEffect } from "react";
import { Card, CardBody, CardHeader, Button, Switch } from "@heroui/react";
import { useTranslations } from "next-intl";
import { updateStoreDeliveryOptions } from "@/lib/actions/store";
import { useStore } from "@/components/providers/store-provider";
import { useSession } from "@/components/providers/session-provider";
import { logger } from '@/lib/logger';

type DeliveryOption = 'pickup' | 'delivery' | 'multi';

interface DeliveryOptionsProps {
  className?: string;
}

const DeliveryOptions: React.FC<DeliveryOptionsProps> = ({ className }) => {
  const t = useTranslations("app/(return_page)/settings/components/delivery-options");
  const { store } = useStore();
  const { registerSaveHandler, setSaveOpen } = useSession();
  
  const [isPickupEnabled, setIsPickupEnabled] = useState(
    store?.deliveryOption === 'pickup' || store?.deliveryOption === 'multi'
  );
  const [isDeliveryEnabled, setIsDeliveryEnabled] = useState(
    store?.deliveryOption === 'delivery' || store?.deliveryOption === 'multi'
  );
  const [optionsChanged, setOptionsChanged] = useState(false);
  const [updatingOptions, setUpdatingOptions] = useState(false);

  if (!store) {
    return null;
  }
  
  // Track changes to delivery options
  const handlePickupChange = (value: boolean) => {
    setIsPickupEnabled(value);
    setOptionsChanged(true);
    setSaveOpen(true);
  };
  
  const handleDeliveryChange = (value: boolean) => {
    setIsDeliveryEnabled(value);
    setOptionsChanged(true);
    setSaveOpen(true);
  };

  // Register save handler
  useEffect(() => {
    const handleDeliveryOptionsSave = async () => {
      logger.debug('deliveryOptions', 'save handler called', { optionsChanged, isPickupEnabled, isDeliveryEnabled });
      if (optionsChanged) {
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
          
          logger.debug('deliveryOptions', 'updating delivery options', { storeId: store.id, deliveryOption });
          // Update the merchant's delivery options
          const success = await updateStoreDeliveryOptions(store.id, deliveryOption);
          logger.debug('deliveryOptions', 'update result', { success });
          
          // Manually update the local store object with the new value
          if (success && store) {
            // Just update the UI state directly - can't modify store context without setStore
            store.deliveryOption = deliveryOption;
            logger.debug('deliveryOptions', 'updated local store state');
          }
          
          setOptionsChanged(false);
          return true;
        } catch (error) {
          logger.error('deliveryOptions', 'Error updating delivery options', { error });
          return false;
        } finally {
          setUpdatingOptions(false);
        }
      }
      logger.debug('deliveryOptions', 'no changes to save');
      return false;
    };
    
    logger.debug('deliveryOptions', 'registering save handler');
    registerSaveHandler('delivery-options', handleDeliveryOptionsSave);
    
    // No need to unregister as the session provider will handle this on pathname change
    return () => {
      logger.debug('deliveryOptions', 'cleanup - component unmounting');
    };
  }, [registerSaveHandler, isPickupEnabled, isDeliveryEnabled, optionsChanged, store]);

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
                onValueChange={handlePickupChange}
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
                onValueChange={handleDeliveryChange}
              />
            </div>
          </div>
          
          {/* <Button 
            onPress={() => setSaveOpen(true)}
            isDisabled={updatingOptions || !optionsChanged}
            className="w-full shadow-small"
            color="primary"
          >
            {updatingOptions ? t("updatingOptions") : t("updateDeliveryOptions")}
          </Button> */}
        </div>
      </CardBody>
    </Card>
  );
};

export default DeliveryOptions; 