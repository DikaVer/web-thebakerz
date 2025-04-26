'use client';

import React, { useState, useEffect } from "react";
import {MerchantDeliveryRegion, updateMerchantDeliveryRegions } from "@/lib/actions/delivery-actions";
import { Card, CardBody, CardHeader, addToast, Button, useDisclosure, Switch } from "@heroui/react";
import { useTranslations } from "next-intl";
import { cityLatLngMap, countryCityLatLngMap, EU_COUNTRIES_PLUS_SWISS } from "@/lib/local-variables";
import { useSession } from "@/components/providers/session-provider";
import { Time } from '@internationalized/date';
import { WorkHours, WorkDay } from "@/lib/actions/calendar-actions";

// Import separated components
import CitySelector from "./delivery/CitySelector";
import CountrySelector from "./delivery/CountrySelector";
import CountryDeliverySettings from "./delivery/CountryDeliverySettings";
import DeliveryRangeSettings from "./delivery/DeliveryRangeSettings";
import CityList from "./delivery/CityList";
import MapView from "./delivery/MapView";
import DeliveryScheduleModal from "./delivery/DeliveryScheduleModal";
import { DeliveryCity, DeliveryRange, CountryDelivery } from "./delivery/types";
import { eurosToCents } from "./delivery/utils";
import { useStore } from "../providers/store-provider";
import { StoreData } from "@/lib/actions/store";
import CountryList from "./delivery/CountryList";

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
  const [countryDeliveries, setCountryDeliveries] = useState<CountryDelivery[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Country selection state
  const [selectedCountry, setSelectedCountry] = useState<string | null>(null);
  const [isCountryDelivery, setIsCountryDelivery] = useState(false);
  const [countryDeliveryPrice, setCountryDeliveryPrice] = useState(500); // 5€ in cents
  const [countryMinOrderPrice, setCountryMinOrderPrice] = useState(1000); // 10€ in cents

  // City selection state
  const [selectedCityForRange, setSelectedCityForRange] = useState<string | null>(null);
  const [currentRanges, setCurrentRanges] = useState<DeliveryRange[]>([{
    range: 10,
    deliveryPriceInCents: 500,
    minOrderPriceInCents: 1000
  }]);
  
  // Schedule modal state
  const [currentCityForSchedule, setCurrentCityForSchedule] = useState<DeliveryCity | null>(null);
  const [currentCountryForSchedule, setCurrentCountryForSchedule] = useState<CountryDelivery | null>(null);
  const [deliverySchedule, setDeliverySchedule] = useState<WorkHours>(emptyWorkHours);
  const {isOpen: isScheduleModalOpen, onOpen: openScheduleModal, onClose: closeScheduleModal} = useDisclosure();
  const { store } = storeData ? {store: storeData }: useStore(); 

  if (!store) {
    return;
  }
  const t = useTranslations("app/(return_page)/settings/components/delivery-settings");

  // Load delivery data on component mount
  useEffect(() => {
    const loadDeliveryData = () => {
      try {
        // Fetch merchant's delivery regions from the server
        const merchantDeliveryRegions = store.deliveryRegions;
        
        const cities: DeliveryCity[] = [];
        const countries: CountryDelivery[] = [];
        
        if (merchantDeliveryRegions && merchantDeliveryRegions.length > 0) {
          merchantDeliveryRegions.forEach(region => {
            // Check if this is a country delivery (format: CC:CountryName)
            if (region.isCountry) {
              if(region.deliveryPriceInCents && region.minOrderPriceInCents) {
                // This is a country delivery
                countries.push({
                    countryCode: region.name,
                    deliveryPriceInCents: region.deliveryPriceInCents,
                    minOrderPriceInCents: region.minOrderPriceInCents,
                    deliverySchedule: region.deliverySchedule,
                    isStoreDelivery: region.isStoreDelivery,
                    isPostDelivery: region.isPostDelivery,
                    minOrderTime: region.minOrderTime
                  });
              }
            } else {
              // This is a city delivery
              let ranges: DeliveryRange[] = [];
              if (Array.isArray(region.ranges) && region.ranges.length > 0) {
                // New format with multiple ranges
                ranges = region.ranges;
              }
              if (region.coordinates) {
                cities.push({
                  name: region.name,
                  ranges: ranges.sort((a, b) => a.range - b.range), // Sort ranges by distance
                  coordinates: region.coordinates,
                  deliverySchedule: region.deliverySchedule,
                  isStoreDelivery: region.isStoreDelivery,
                  isPostDelivery: region.isPostDelivery,
                  minOrderTime: region.minOrderTime
                });
              }
            }
          });
          
          setDeliveryCities(cities);
          setCountryDeliveries(countries);
        } else {
          // Initialize with empty arrays if no regions found
          setDeliveryCities([]);
          setCountryDeliveries([]);
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

    loadDeliveryData();
  }, [t, session, store]);

  const handleSave = async () => {
    try {
      setSaving(true);
      
      // Convert delivery cities and countries to the format expected by the API
      const regions: MerchantDeliveryRegion[] = [
        // Add city regions
        ...deliveryCities.map(city => ({
          id: `${store.id}-${city.name}`,
          storeId: store.id,
          name: city.name,
          coordinates: city.coordinates,
          deliverySchedule: city.deliverySchedule,
          isStoreDelivery: city.isStoreDelivery,
          isPostDelivery: city.isPostDelivery,
          minOrderTime: city.minOrderTime,
          ranges: city.ranges, // Add the ranges array
          isCountry: false
        })),
        
        // Add country regions
        ...countryDeliveries.map(country => {
          return {
            id: `${store.id}-${country.countryCode}`,
            storeId: store.id,
            name: country.countryCode,
            deliverySchedule: country.deliverySchedule,
            isStoreDelivery: country.isStoreDelivery,
            isPostDelivery: country.isPostDelivery ,
            minOrderTime: country.minOrderTime,
            deliveryPriceInCents: country.deliveryPriceInCents,
            minOrderPriceInCents: country.minOrderPriceInCents,
            isCountry: true
          };
        })
      ];
      
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

  // Handle country selection
  const handleCountrySelection = (countryCode: string) => {
    setSelectedCountry(countryCode);
    
    // Check if country is already in our delivery countries
    const existingCountry = countryDeliveries.find(country => country.countryCode === countryCode);
    if (existingCountry && isCountryDelivery) {
      setCountryDeliveryPrice(existingCountry.deliveryPriceInCents);
      setCountryMinOrderPrice(existingCountry.minOrderPriceInCents);
    } else {
      // Initialize with default values
      setCountryDeliveryPrice(500); // 5€
      setCountryMinOrderPrice(1000); // 10€
    }
    
    // Initialize city selection if country has cities and we're in city delivery mode
    if (!isCountryDelivery && countryCityLatLngMap[countryCode]) {
      const citiesInCountry = Object.keys(countryCityLatLngMap[countryCode]);
      if (citiesInCountry.length > 0) {
        setSelectedCityForRange(null); // Reset city selection
      }
    }
  };

  // Handle delivery type change (country/city)
  const handleDeliveryTypeChange = (isCountry: boolean) => {
    setIsCountryDelivery(isCountry);
    
    // Reset selections when changing modes
    if (isCountry) {
      setSelectedCityForRange(null);
    } else {
      setCountryDeliveryPrice(500);
      setCountryMinOrderPrice(1000);
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

  // Handle country delivery price change
  const handleCountryDeliveryPriceChange = (value: string) => {
    const euros = parseFloat(value) || 0;
    setCountryDeliveryPrice(eurosToCents(euros));
  };
  
  // Handle country minimum order price change
  const handleCountryMinOrderPriceChange = (value: string) => {
    const euros = parseFloat(value) || 0;
    setCountryMinOrderPrice(eurosToCents(euros));
  };
  
  // Save country delivery settings
  const handleSaveCountryDelivery = () => {
    if (!selectedCountry) return;
    
    // Validate minimum order price
    if (countryMinOrderPrice < 1000) {
      addToast({
        title: t("minOrderPriceError"),
        color: "danger",
        shouldShowTimeoutProgress: true,
        timeout: 2000,
      });
      return;
    }
    
    // Check if country is already in the list
    const existingCountryIndex = countryDeliveries.findIndex(country => 
      country.countryCode === selectedCountry
    );
    
    if (existingCountryIndex >= 0) {
      // Update existing country
      const updatedCountries = [...countryDeliveries];
        updatedCountries[existingCountryIndex] = {
        ...updatedCountries[existingCountryIndex],
        deliveryPriceInCents: countryDeliveryPrice,
        minOrderPriceInCents: countryMinOrderPrice
      };
      setCountryDeliveries(updatedCountries);
    } else {
      // Add new country
      setCountryDeliveries([...countryDeliveries, {
        countryCode: selectedCountry,
        deliveryPriceInCents: countryDeliveryPrice,
        minOrderPriceInCents: countryMinOrderPrice,
        deliverySchedule: emptyWorkHours,
        isStoreDelivery: session?.user?.role !== "admin" ? true : false,
        isPostDelivery: false, // Default to false for new countries
        minOrderTime: 10080
      }]);
    }
    
    // Reset after adding
    setSelectedCountry(null);
    setCountryDeliveryPrice(500);
    setCountryMinOrderPrice(1000);
  };

  // Handle removing a delivery country
  const handleRemoveCountry = (countryCode: string) => {
    setCountryDeliveries(countryDeliveries.filter(country => 
      country.countryCode !== countryCode
    ));
    
    // Clear the selection if needed
    if (selectedCountry === countryCode) {
      setSelectedCountry(null);
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
    if (!selectedCityForRange || !selectedCountry) return;
    
    // Validate the city exists in our predefined list for the selected country
    if (!(selectedCountry in countryCityLatLngMap) || 
        !(selectedCityForRange in countryCityLatLngMap[selectedCountry])) {
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
        coordinates: countryCityLatLngMap[selectedCountry][selectedCityForRange],
        deliverySchedule: emptyWorkHours,
        isStoreDelivery: session?.user?.role !== "admin" ? true : false,
        isPostDelivery: false,
        minOrderTime: 10080
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

  // Open modal for managing delivery schedule
  const handleManageSchedule = (item: DeliveryCity | CountryDelivery, isCountry: boolean = false) => {
    if (isCountry) {
      const country = item as CountryDelivery;
      setCurrentCountryForSchedule(country);
      setCurrentCityForSchedule(null);
    } else {
      setCurrentCityForSchedule(item as DeliveryCity);
      setCurrentCountryForSchedule(null);
    }
    
    setDeliverySchedule(item.deliverySchedule || emptyWorkHours);
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

  // Save delivery schedule
  const handleSaveSchedule = () => {
    if (currentCityForSchedule) {
      if (currentCountryForSchedule) {
        // This was a country delivery being edited through a city stub
        const updatedCountries = countryDeliveries.map(country => 
          country.countryCode === currentCountryForSchedule.countryCode 
            ? { ...country, deliverySchedule } 
            : country
        );
        setCountryDeliveries(updatedCountries);
      } else {
        // This was a regular city delivery
        const updatedCities = deliveryCities.map(city => 
          city.name === currentCityForSchedule.name 
            ? { ...city, deliverySchedule } 
            : city
        );
        setDeliveryCities(updatedCities);
      }
    }
    
    closeScheduleModal();
  };

  // Handle min order time change from modal
  const handleMinOrderTimeChange = (minutes: number) => {
    if (currentCityForSchedule) {
      if (currentCountryForSchedule) {
        // This was a country delivery being edited through a city stub
        const updatedCountries = countryDeliveries.map(country => 
          country.countryCode === currentCountryForSchedule.countryCode 
            ? { ...country, minOrderTime: minutes } 
            : country
        );
        setCountryDeliveries(updatedCountries);
      } else {
        // This was a regular city delivery
        const updatedCities = deliveryCities.map(city => 
          city.name === currentCityForSchedule.name 
            ? { ...city, minOrderTime: minutes } 
            : city
        );
        setDeliveryCities(updatedCities);
      }
    }
  };

  // Add a new function to handle toggling post delivery
  const handleTogglePostDelivery = (country: CountryDelivery, isPostDelivery: boolean) => {
    const updatedCountries = countryDeliveries.map(c => 
      c.countryCode === country.countryCode 
        ? { ...c, isPostDelivery } 
        : c
    );
    setCountryDeliveries(updatedCountries);
  };

  if (loading) {
    return <div className="p-4">{t("loadingMap")}</div>;
  }

  return (
    <div className="space-y-6">
      {/* Delivery Regions Card */}
      <Card className="w-full max-w-2xl mx-auto">
        <CardHeader>
          {t("deliveryRegions")}
        </CardHeader>
        <CardBody>
          <div className="space-y-6">
            {/* Country selection with Autocomplete */}
            <CountrySelector 
              selectedCountry={selectedCountry} 
              isCountryDelivery={isCountryDelivery}
              onCountrySelect={handleCountrySelection}
              onDeliveryTypeChange={handleDeliveryTypeChange}
            />
            
            {/* Country delivery settings - only show when a country is selected and country delivery is enabled */}
            {selectedCountry && isCountryDelivery && (
              <CountryDeliverySettings
                countryCode={selectedCountry}
                countryName={EU_COUNTRIES_PLUS_SWISS[selectedCountry]}
                deliveryPrice={countryDeliveryPrice}
                minOrderPrice={countryMinOrderPrice}
                onDeliveryPriceChange={handleCountryDeliveryPriceChange}
                onMinOrderPriceChange={handleCountryMinOrderPriceChange}
                onSave={handleSaveCountryDelivery}
              />
            )}
            
            {/* City selection - only show when a country is selected and city delivery is enabled */}
            {selectedCountry && !isCountryDelivery && (
              <CitySelector 
                cityOptions={Object.keys(countryCityLatLngMap[selectedCountry] || {}).sort()}
                onCitySelect={handleCitySelectionChange} 
              />
            )}
            
            {/* Range slider and price input - only show when a city is selected */}
            {selectedCountry && !isCountryDelivery && selectedCityForRange && (
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
            
            {/* Selected countries list */}
            {countryDeliveries.length > 0 && (
              <div className="space-y-2 mt-6">
                <h3 className="text-sm font-medium">
                  {t("selectedCountries")}
                </h3>
                <CountryList
                  countries={countryDeliveries}
                  onRemoveCountry={handleRemoveCountry}
                  onManageSchedule={(country) => handleManageSchedule(country, true)}
                  onTogglePostDelivery={handleTogglePostDelivery}
                />
              </div>
            )}
            
            {/* Selected cities with their ranges and prices */}
            {deliveryCities.length > 0 && (
              <div className="space-y-2 mt-6">
                <h3 className="text-sm font-medium">
                  {t("selectedCities")}
                </h3>
                <CityList
                  cities={deliveryCities}
                  onRemoveCity={handleRemoveCity}
                  onManageSchedule={(city) => handleManageSchedule(city, false)}
                />
              </div>
            )}
            
            {/* Map component - only show for city delivery */}
            <MapView
              cities={deliveryCities}
              selectedCity={selectedCityForRange}
              deliveryRanges={currentRanges}
              cityCoordinates={selectedCountry ? countryCityLatLngMap[selectedCountry] || {} : cityLatLngMap}
            />
            
            <Button 
              onPress={handleSave}
              isDisabled={saving}
              className="w-full shadow-small text-black"
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
          name={currentCityForSchedule?.name || EU_COUNTRIES_PLUS_SWISS[currentCountryForSchedule?.countryCode || ""] || "Error"}
          deliverySchedule={deliverySchedule}
          setDeliveryTime={setDeliveryTime}
          saving={saving}
          onMinOrderTimeChange={handleMinOrderTimeChange}
          minOrderTimeParam={currentCityForSchedule?.minOrderTime || currentCountryForSchedule?.minOrderTime || 10080}
        />
      </Card>
    </div>
  );
};

export default DeliveryManager;