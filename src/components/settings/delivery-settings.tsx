'use client';

import React, { useState, useCallback, useEffect } from "react";
import { getMerchantDeliveryRegions, updateMerchantDeliveryRegions} from "@/lib/actions/delivery-actions";
import { Card, CardBody, CardHeader, addToast, Button, useDisclosure, Switch } from "@heroui/react";
import { useTranslations } from "next-intl";
import { cityLatLngMap } from "@/lib/local-variables";
import { useSession } from "@/components/providers/session-provider";
import { Time } from '@internationalized/date';
import { updateStoreDeliveryOptions } from "@/lib/actions/store";
import { WorkHours, WorkDay } from "@/lib/actions/calendar-actions";

// Import separated components
import CitySelector from "./delivery/CitySelector";
import DeliveryRangeSettings from "./delivery/DeliveryRangeSettings";
import CityList from "./delivery/CityList";
import MapView from "./delivery/MapView";
import DeliveryScheduleModal from "./delivery/DeliveryScheduleModal";
import { DeliveryCity as DeliveryCityType } from "./delivery/types";
import { eurosToCents } from "./delivery/utils";

type DeliveryOption = 'pickup' | 'delivery' | 'multi';

// Create an empty WorkHours object with the right structure
const defaultWorkDay: WorkDay = {
  isEnabled: false,
  start: { hour: 9, minute: 0 },
  end: { hour: 17, minute: 0 }
};

const emptyWorkHours: WorkHours = {
  monday: { ...defaultWorkDay },
  tuesday: { ...defaultWorkDay },
  wednesday: { ...defaultWorkDay },
  thursday: { ...defaultWorkDay },
  friday: { ...defaultWorkDay },
  saturday: { ...defaultWorkDay },
  sunday: { ...defaultWorkDay }
};

const DeliveryManager = () => {
  const { session } = useSession();
  const [deliveryCities, setDeliveryCities] = useState<DeliveryCityType[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [updatingOptions, setUpdatingOptions] = useState(false);
  const [selectedCityForRange, setSelectedCityForRange] = useState<string | null>(null);
  const [deliveryRange, setDeliveryRange] = useState(10); // Default delivery range 10km
  const [deliveryPriceInCents, setDeliveryPriceInCents] = useState(500); // Default delivery price 5€ in cents
  const [minOrderPriceInCents, setMinOrderPriceInCents] = useState(1000); // Default minimum order price 10€ in cents
  const [currentCityForSchedule, setCurrentCityForSchedule] = useState<DeliveryCityType | null>(null);
  const [deliverySchedule, setDeliverySchedule] = useState<WorkHours>(emptyWorkHours);
  const [isPickupEnabled, setIsPickupEnabled] = useState(true);
  const [isDeliveryEnabled, setIsDeliveryEnabled] = useState(false);
  const {isOpen: isScheduleModalOpen, onOpen: openScheduleModal, onClose: closeScheduleModal} = useDisclosure();
  const t = useTranslations("app/(return_page)/settings/components/delivery-settings");

  // Load cities on component mount
  useEffect(() => {
    const loadCities = async () => {
      try {
        // Get store ID from session
        const storeId = session.store?.id;
        if (!storeId) {
          throw new Error("Store not found in session");
        }
        
        // Fetch merchant's delivery cities from the server
        const merchantDeliveryRegions = await getMerchantDeliveryRegions(storeId);
        if (merchantDeliveryRegions && merchantDeliveryRegions.length > 0) {
          const cities = merchantDeliveryRegions.map(region => ({
            name: region.name,
            range: region.radiusKm,
            priceInCents: region.priceInCents,
            minOrderPriceInCents: region.minOrderPriceInCents || 1000, // Default to 10€ if not set
            coordinates: region.coordinates,
            deliverySchedule: region.deliverySchedule || {...emptyWorkHours},
            isStoreDelivery: region.isStoreDelivery,
            minOrderTime: region.minOrderTime || 1440 // Default to 24 hours if not set
          }));
          setDeliveryCities(cities);
        } else {
          // Initialize with empty array if no regions found
          setDeliveryCities([]);
        }

        // Set initial delivery options based on session
        if (session.store?.deliveryOption) {
          const deliveryOption = session.store.deliveryOption;
          setIsPickupEnabled(deliveryOption === 'pickup' || deliveryOption === 'multi');
          setIsDeliveryEnabled(deliveryOption === 'delivery' || deliveryOption === 'multi');
        }
      } catch (error) {
        addToast({
          title: t("loadError"),
          color: "danger",
          shouldShowTimeoutProgress: true,
          timeout: 2000,
        });
      } finally {
        setLoading(false);
      }
    };

    loadCities();
  }, [t, session]);

  const handleSave = async () => {
    try {
      setSaving(true);
      // Get store ID from session
      const storeId = session.store?.id;
      if (!storeId) {
        throw new Error("Store ID not found in session");
      }
      
      // Convert delivery cities to the format expected by the API
      const regions = deliveryCities.map(city => ({
        name: city.name,
        radiusKm: city.range,
        priceInCents: city.priceInCents,
        minOrderPriceInCents: city.minOrderPriceInCents,
        coordinates: city.coordinates,
        deliverySchedule: city.deliverySchedule || {...emptyWorkHours},
        isStoreDelivery: city.isStoreDelivery,
        minOrderTime: city.minOrderTime || 1444
      }));
      
      // Update the merchant's delivery regions
      await updateMerchantDeliveryRegions(regions);
      
      addToast({
        title: t("updateSuccess"),
        color: "success",
        shouldShowTimeoutProgress: true,
        timeout: 2000,
      });
    } catch (error) {
      addToast({
        title: t("updateError"),
        color: "danger",
        shouldShowTimeoutProgress: true,
        timeout: 2000,
      });
    } finally {
      setSaving(false);
    }
  };

  const handleUpdateDeliveryOptions = async () => {
    try {
      setUpdatingOptions(true);
      // Get store ID from session
      const storeId = session.store?.id;
      if (!storeId) {
        throw new Error("Store ID not found in session");
      }
      
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
      await updateStoreDeliveryOptions(deliveryOption);
      
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

  // Handle selecting a city from the autocomplete
  const handleCitySelectionChange = (cityName: string) => {    
    setSelectedCityForRange(cityName);
    
    // Check if city is already in our delivery cities
    const existingCity = deliveryCities.find(city => city.name === cityName);
    if (existingCity) {
      setDeliveryRange(existingCity.range);
      setDeliveryPriceInCents(existingCity.priceInCents);
      setMinOrderPriceInCents(existingCity.minOrderPriceInCents || 1000);
    } else {
      setDeliveryRange(10); // Default range
      setDeliveryPriceInCents(500); // Default price in cents (5€)
      setMinOrderPriceInCents(1000); // Default minimum order price in cents (10€)
    }
  };

  // Handle removing a delivery city
  const handleRemoveCity = (cityName: string) => {
    setDeliveryCities(deliveryCities.filter(city => city.name !== cityName));
    
    // Clear the selection if needed
    if (selectedCityForRange === cityName) {
      setSelectedCityForRange(null);
    }
  };

  // Handle adding or updating a delivery city's range
  const handleSetDeliveryRange = () => {
    if (!selectedCityForRange) return;
    
    // Validate the city exists in our predefined list
    if (!(selectedCityForRange in cityLatLngMap)) {
      addToast({
        title: t("invalidCity"),
        color: "danger",
        shouldShowTimeoutProgress: true,
        timeout: 2000,
      });
      return;
    }

    // Validate minimum order price
    if (minOrderPriceInCents < 1000) {
      addToast({
        title: t("minOrderPriceError"),
        color: "danger",
        shouldShowTimeoutProgress: true,
        timeout: 2000,
      });
      return;
    }
    
    // Check if city is already in the list
    const existingCityIndex = deliveryCities.findIndex(city => city.name === selectedCityForRange);
    
    if (existingCityIndex >= 0) {
      // Update existing city
      const updatedCities = [...deliveryCities];
      updatedCities[existingCityIndex] = {
        ...updatedCities[existingCityIndex],
        range: deliveryRange,
        priceInCents: deliveryPriceInCents,
        minOrderPriceInCents: minOrderPriceInCents,
        minOrderTime: updatedCities[existingCityIndex].minOrderTime || 1440
      };
      setDeliveryCities(updatedCities);
    } else {
      // Add new city
      setDeliveryCities([...deliveryCities, { 
        name: selectedCityForRange, 
        range: deliveryRange,
        priceInCents: deliveryPriceInCents,
        minOrderPriceInCents: minOrderPriceInCents,
        minOrderTime: 1440,
        coordinates: cityLatLngMap[selectedCityForRange],
        deliverySchedule: undefined,
        isStoreDelivery: true
      }]);
    }
    
    // Reset after adding
    setSelectedCityForRange(null);
  };

  // Helper function to handle price input in euros but store in cents
  const handlePriceChange = (value: string) => {
    const euros = parseFloat(value) || 0;
    setDeliveryPriceInCents(eurosToCents(euros));
  };

  // Helper function to handle minimum order price input in euros but store in cents
  const handleMinOrderPriceChange = (value: string) => {
    const euros = parseFloat(value) || 0;
    setMinOrderPriceInCents(eurosToCents(euros));
  };

  // Open modal for managing delivery schedule for a city
  const handleManageSchedule = (city: DeliveryCityType) => {
    setCurrentCityForSchedule(city);
    setDeliverySchedule(city.deliverySchedule || { ...emptyWorkHours });
    openScheduleModal();
  };

  // Handle setting delivery time for a specific day
  const setDeliveryTime = (
    day: string,
    data: { isEnabled: boolean; startTime: Time | null; endTime: Time | null }
  ) => {
    setDeliverySchedule((prev: WorkHours) => ({
      ...prev,
      [day]: {
        isEnabled: data.isEnabled,
        start: data.startTime
          ? { hour: data.startTime.hour, minute: data.startTime.minute }
          : { hour: 0, minute: 0 },
        end: data.endTime
          ? { hour: data.endTime.hour, minute: data.endTime.minute }
          : { hour: 0, minute: 0 },
      },
    }));
  };

  // Save delivery schedule for the current city
  const handleSaveSchedule = () => {
    if (!currentCityForSchedule) return;

    const updatedCities = deliveryCities.map(city => 
      city.name === currentCityForSchedule.name 
        ? { ...city, deliverySchedule } 
        : city
    );
    
    setDeliveryCities(updatedCities);
    closeScheduleModal();
  };

  // Handle min order time change from modal
  const handleMinOrderTimeChange = (minutes: number) => {
    if (!currentCityForSchedule) return;
    
    const updatedCities = deliveryCities.map(city => 
      city.name === currentCityForSchedule.name 
        ? { ...city, minOrderTime: minutes } 
        : city
    );
    
    setDeliveryCities(updatedCities);
  };

  if (loading) {
    return <div className="p-4">{t("loadingMap")}</div>;
  }

  // Create city options from cityLatLngMap for the Autocomplete component
  const cityOptions = Object.keys(cityLatLngMap).sort();

  return (
    <div className="space-y-6">
      {/* Delivery Options Card */}
      <Card className="w-full max-w-2xl mx-auto">
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


      {/* Delivery Regions Card */}
      <Card className="w-full max-w-2xl mx-auto">
        <CardHeader>
          {t("deliveryRegions")}
        </CardHeader>
        <CardBody>
          <div className="space-y-6">
            {/* City selection with Autocomplete */}
            <CitySelector 
              cityOptions={cityOptions} 
              onCitySelect={handleCitySelectionChange} 
            />
            
            {/* Range slider and price input - only show when a city is selected */}
            {selectedCityForRange && (
              <DeliveryRangeSettings
                cityName={selectedCityForRange}
                deliveryRange={deliveryRange}
                deliveryPriceInCents={deliveryPriceInCents}
                minOrderPriceInCents={minOrderPriceInCents}
                onRangeChange={setDeliveryRange}
                onPriceChange={handlePriceChange}
                onMinOrderPriceChange={handleMinOrderPriceChange}
                onSave={handleSetDeliveryRange}
              />
            )}
            
            {/* Selected cities with their ranges and prices */}
            <div className="space-y-2">
              <h3 className="text-sm font-medium">
                {t("selectedCities")}
              </h3>
              
              <CityList
                cities={deliveryCities}
                onRemoveCity={handleRemoveCity}
                onManageSchedule={handleManageSchedule}
              />
            </div>
            
            {/* Map component */}
            <MapView
              cities={deliveryCities}
              selectedCity={selectedCityForRange}
              deliveryRange={deliveryRange}
              cityCoordinates={cityLatLngMap}
            />
            
            <Button 
              onPress={handleSave}
              isDisabled={saving}
              className="w-full shadow-small text-text"
              color={'secondary'}
            >
              {saving ? t("saving") : t("saveDeliveryRegions")}
            </Button>
          </div>
        </CardBody>

        {/* Delivery Schedule Modal */}
        <DeliveryScheduleModal
          isOpen={isScheduleModalOpen}
          onClose={closeScheduleModal}
          onSave={handleSaveSchedule}
          city={currentCityForSchedule}
          deliverySchedule={deliverySchedule}
          setDeliveryTime={setDeliveryTime}
          saving={saving}
          onMinOrderTimeChange={handleMinOrderTimeChange}
        />
      </Card>
    </div>
  );
};

export default DeliveryManager;