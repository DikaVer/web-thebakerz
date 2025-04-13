'use client';

import React, { useState, useEffect } from "react";
import {updateMerchantDeliveryRegions } from "@/lib/actions/delivery-actions";
import { Card, CardBody, CardHeader, addToast, Button, useDisclosure, Switch } from "@heroui/react";
import { useTranslations } from "next-intl";
import { cityLatLngMap } from "@/lib/local-variables";
import { useSession } from "@/components/providers/session-provider";
import { Time } from '@internationalized/date';
import { WorkHours, WorkDay } from "@/lib/actions/calendar-actions";

// Import separated components
import CitySelector from "./delivery/CitySelector";
import DeliveryRangeSettings from "./delivery/DeliveryRangeSettings";
import CityList from "./delivery/CityList";
import MapView from "./delivery/MapView";
import DeliveryScheduleModal from "./delivery/DeliveryScheduleModal";
import { DeliveryCity, DeliveryRange } from "./delivery/types";
import { eurosToCents } from "./delivery/utils";
import { useStore } from "../providers/store-provider";
import { StoreData } from "@/lib/actions/store";

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

interface DeliveryManagerProps {
  storeData?: StoreData;
}

const DeliveryManager: React.FC<DeliveryManagerProps> = ({ storeData }) => {
  const { session } = useSession();
  const [deliveryCities, setDeliveryCities] = useState<DeliveryCity[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [selectedCityForRange, setSelectedCityForRange] = useState<string | null>(null);
  const [currentRanges, setCurrentRanges] = useState<DeliveryRange[]>([{
    range: 10,
    deliveryPriceInCents: 500,
    minOrderPriceInCents: 1000
  }]);
  const [currentCityForSchedule, setCurrentCityForSchedule] = useState<DeliveryCity | null>(null);
  const [deliverySchedule, setDeliverySchedule] = useState<WorkHours>(emptyWorkHours);
  const {isOpen: isScheduleModalOpen, onOpen: openScheduleModal, onClose: closeScheduleModal} = useDisclosure();
  const { store } = storeData ? {store: storeData }: useStore(); 

  if (!store) {
    return;
  }
  const t = useTranslations("app/(return_page)/settings/components/delivery-settings");

  // Load cities on component mount
  useEffect(() => {
    const loadCities = () => {
      try {
        // Fetch merchant's delivery cities from the server
        const merchantDeliveryRegions = store.deliveryRegions;
        if (merchantDeliveryRegions && merchantDeliveryRegions.length > 0) {
          const cities = merchantDeliveryRegions.map(region => {
            // Convert legacy format to multi-range format if needed
            let ranges: DeliveryRange[] = [];
            if (Array.isArray(region.ranges) && region.ranges.length > 0) {
              // New format with multiple ranges
              ranges = region.ranges;
            } else {
              // Legacy format with single range
              ranges = [{
                range: region.radiusKm,
                deliveryPriceInCents: region.priceInCents,
                minOrderPriceInCents: region.minOrderPriceInCents || 1000
              }];
            }
            
            return {
              name: region.name,
              ranges: ranges.sort((a, b) => a.range - b.range), // Sort ranges by distance
              coordinates: region.coordinates,
              deliverySchedule: region.deliverySchedule || {...emptyWorkHours},
              isStoreDelivery: region.isStoreDelivery,
              minOrderTime: region.minOrderTime || 1440 // Default to 24 hours if not set
            };
          });
          setDeliveryCities(cities);
        } else {
          // Initialize with empty array if no regions found
          setDeliveryCities([]);
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
      
      // Convert delivery cities to the format expected by the API
      const regions = deliveryCities.map(city => ({
        name: city.name,
        radiusKm: city.ranges[0]?.range || 10, // Keep for backward compatibility
        priceInCents: city.ranges[0]?.deliveryPriceInCents || 500, // Keep for backward compatibility
        minOrderPriceInCents: city.ranges[0]?.minOrderPriceInCents || 1000, // Keep for backward compatibility
        coordinates: city.coordinates,
        deliverySchedule: city.deliverySchedule || {...emptyWorkHours},
        isStoreDelivery: city.isStoreDelivery,
        minOrderTime: city.minOrderTime || 1444,
        ranges: city.ranges // Add the new ranges array
      }));
      
      // Update the merchant's delivery regions
      await updateMerchantDeliveryRegions(store.id, regions);
      
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

  // Handle selecting a city from the autocomplete
  const handleCitySelectionChange = (cityName: string) => {    
    setSelectedCityForRange(cityName);
    
    // Check if city is already in our delivery cities
    const existingCity = deliveryCities.find(city => city.name === cityName);
    if (existingCity) {
      setCurrentRanges([...existingCity.ranges]);
    } else {
      // Initialize with a single default range
      setCurrentRanges([{
        range: 10,
        deliveryPriceInCents: 500,
        minOrderPriceInCents: 1000
      }]);
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

  // Handle adding or updating a delivery city's ranges
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

    // Validate ranges are in ascending order
    for (let i = 1; i < currentRanges.length; i++) {
      if (currentRanges[i].range <= currentRanges[i-1].range) {
        addToast({
          title: t("rangeOrderError"),
          color: "danger",
          shouldShowTimeoutProgress: true,
          timeout: 2000,
        });
        return;
      }
    }
    
    // Validate minimum order prices
    for (const range of currentRanges) {
      if (range.minOrderPriceInCents < 1000) {
        addToast({
          title: t("minOrderPriceError"),
          color: "danger",
          shouldShowTimeoutProgress: true,
          timeout: 2000,
        });
        return;
      }
    }
    
    // Check if city is already in the list
    const existingCityIndex = deliveryCities.findIndex(city => city.name === selectedCityForRange);
    
    if (existingCityIndex >= 0) {
      // Update existing city
      const updatedCities = [...deliveryCities];
      updatedCities[existingCityIndex] = {
        ...updatedCities[existingCityIndex],
        ranges: currentRanges
      };
      setDeliveryCities(updatedCities);
    } else {
      // Add new city
      setDeliveryCities([...deliveryCities, { 
        name: selectedCityForRange, 
        ranges: currentRanges,
        coordinates: cityLatLngMap[selectedCityForRange],
        deliverySchedule: undefined,
        isStoreDelivery:  session?.user?.role !== "admin" ? true : false,
        minOrderTime: 1440
      }]);
    }
    
    // Reset after adding
    setSelectedCityForRange(null);
    setCurrentRanges([{
      range: 10,
      deliveryPriceInCents: 500,
      minOrderPriceInCents: 1000
    }]);
  };

  // Handle range change for a specific range index
  const handleRangeChange = (index: number, value: number) => {
    const newRanges = [...currentRanges];
    newRanges[index].range = value;
    setCurrentRanges(newRanges);
  };

  // Handle price change for a specific range index
  const handlePriceChange = (index: number, value: string) => {
    const euros = parseFloat(value) || 0;
    const newRanges = [...currentRanges];
    newRanges[index].deliveryPriceInCents = eurosToCents(euros);
    setCurrentRanges(newRanges);
  };

  // Handle minimum order price change for a specific range index
  const handleMinOrderPriceChange = (index: number, value: string) => {
    const euros = parseFloat(value) || 0;
    const newRanges = [...currentRanges];
    newRanges[index].minOrderPriceInCents = eurosToCents(euros);
    setCurrentRanges(newRanges);
  };

  // Add a new range
  const handleAddRange = () => {
    if (currentRanges.length >= 5) return; // Limit to 5 ranges
    
    // Get the last range value to use as a base for the new range
    const lastRange = currentRanges[currentRanges.length - 1];
    
    // Add a new range that's 5km more than the last one
    setCurrentRanges([...currentRanges, {
      range: lastRange.range + 5,
      deliveryPriceInCents: lastRange.deliveryPriceInCents + 100, // Add 1€ to previous range price
      minOrderPriceInCents: lastRange.minOrderPriceInCents
    }]);
  };

  // Remove a range
  const handleRemoveRange = (index: number) => {
    if (index === 0 || currentRanges.length <= 1) return; // Keep at least one range
    
    const newRanges = [...currentRanges];
    newRanges.splice(index, 1);
    setCurrentRanges(newRanges);
  };

  // Open modal for managing delivery schedule for a city
  const handleManageSchedule = (city: DeliveryCity) => {
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
                ranges={currentRanges}
                onRangeChange={handleRangeChange}
                onPriceChange={handlePriceChange}
                onMinOrderPriceChange={handleMinOrderPriceChange}
                onSave={handleSetDeliveryRange}
                onAddRange={handleAddRange}
                onRemoveRange={handleRemoveRange}
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
              deliveryRanges={currentRanges}
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