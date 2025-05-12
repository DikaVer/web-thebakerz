'use client';

import React, { createContext, useContext, ReactNode, useState, useEffect, useCallback } from 'react';
import { CalendarDateTime, CalendarDate } from "@internationalized/date";
import { setDeliveryMode} from '@/lib/delivery-cookie';
import { addToast } from "@heroui/react";
import { useStore } from '@/components/providers/store-provider';
import { updateOrderTime, getOrderTime, updateDeliveryTime, getDeliveryTime, removeAllSchedules } from '@/app/(store)/[id]/actions';
import { DeliveryAddress as DbDeliveryAddress, DeliveryAddress, DeliveryAddressRaw, ExtendedDeliveryAddressRaw } from '@/app/(store)/[id]/delivery-actions';
import { parseDateParams, parseDateTime } from "@/components/store/store-header/calendar/calendar-params";
import { MerchantDeliveryRegion, DeliveryRange } from '@/lib/actions/delivery-actions';
import { haversineDistance } from '@/lib/utils';
import { logger } from '@/lib/logger';
import { saveDeliveryAddress } from '@/lib/actions/delivery-address-actions';
import { useDeliveryAddressModal } from '../ui/select-time/use-delivery-address-modal';

export interface ValidationResult {
    isValid: boolean;
    isInRange: boolean;
    message: string;
    deliveryRegion?: MerchantDeliveryRegion;
    validatedAddress?: DeliveryAddressRaw;
}

interface DeliveryContextProps {
    // Delivery mode state
    isDelivery: boolean;
    isTogglingDelivery: boolean;
    toggleDeliveryMode: (value: boolean) => Promise<void>;
    
    // Date selection
    selectedDate: CalendarDateTime | CalendarDate | undefined;
    isLoadingDate: boolean;
    isDateUpdating: boolean;
    minLeadTimeProduct: number | null;
    setMinLeadTimeProduct: (minLeadTime: number | null) => void;
    handleDateChange: (newDate: CalendarDateTime | CalendarDate) => Promise<void>;
    setSelectedDate: (newDate: CalendarDateTime | CalendarDate | undefined) => void;
    
    // Address management
    address: ExtendedDeliveryAddressRaw | null;
    handleAddressSubmit: (addressData: ExtendedDeliveryAddressRaw) => Promise<void>;
    
    // Address validation
    validationResult: ValidationResult;
    isValidating: boolean;

    // Delivery address modal
    deliveryAddressModal: ReturnType<typeof useDeliveryAddressModal>;
    
}

export const useDelivery = () => {
  const context = useContext(DeliveryContext);
  if (!context) {
    throw new Error('useDelivery must be used within a DeliveryProvider');
  }
  return context;
};

const DeliveryContext = createContext<DeliveryContextProps | undefined>(undefined);

interface DeliveryProviderProps {
  children: ReactNode;
  initialDeliveryMode: boolean;
  initialAddress: DeliveryAddress | null;
  isStore?: boolean;
}

export const DeliveryProvider: React.FC<DeliveryProviderProps> = ({
  children,
  initialDeliveryMode = false,
  initialAddress = null,
  isStore = true
}) => {
  const { store } =  isStore ? useStore() : { store: null };
  const [isDelivery, setIsDelivery] = useState(initialDeliveryMode);
  const [isTogglingDelivery, setIsTogglingDelivery] = useState(false);
  
  // Date selection state
  const [selectedDate, setSelectedDate] = useState<CalendarDateTime | CalendarDate | undefined>(undefined);
  const [isLoadingDate, setIsLoadingDate] = useState(true);
  const [isDateUpdating, setIsDateUpdating] = useState(false);
  const [minLeadTimeProduct, setMinLeadTimeProduct] = useState<number | null>(null);
  
  // Address state
  const [address, setAddress] = useState<DeliveryAddressRaw | null>(initialAddress);

  // Validation state - set initial validation for pre-loaded address
  const [isValidating, setIsValidating] = useState(false);
  const [validationResult, setValidationResult] = useState<ValidationResult>({
    isValid: false,
    isInRange: false,
    message: "Please enter your delivery address.",
    validatedAddress: undefined
  });

  // Delivery address modal state
  const deliveryAddressModal = useDeliveryAddressModal({
    onSubmitSuccess: () => {
      // Optional callback for when address is successfully submitted
      logger.debug("deliveryProvider", "Address submitted successfully");
    }
  });

  logger.debug("deliveryProvider", "Initial address:", { address });
  
  // Validate initial address when component mounts
  useEffect(() => {
    const validateInitialAddress = async () => {
      if (address && store?.id) {
        try {
          setIsValidating(true);

          
          // 3. Calculate distances and find the closest region
          logger.debug("deliveryProvider", "Calculating distances to regions", { 
            regionCount: store.deliveryRegions.length 
          });
          
          let closestRegion: MerchantDeliveryRegion | null = null;
          let minDistance = Infinity;
          let applicableRange: DeliveryRange | null = null;
          let minPrice = Infinity;
        
          for (const region of store.deliveryRegions) {
            logger.debug("deliveryProvider", `Checking region: ${region.name}`);
            
            // Check for country-wide delivery first
            if (region.isCountry && address.country && 
                region.minOrderPriceInCents && region.deliveryPriceInCents && region.deliveryWindow &&
                minPrice > region.minOrderPriceInCents &&
                region.name.toLowerCase() === address.country.toLowerCase()) {

                logger.debug("deliveryProvider", `Found country-wide delivery region: ${region.name}`);
                closestRegion = region;
                minPrice = region.minOrderPriceInCents;
                applicableRange = {
                  range: 0,
                  deliveryPriceInCents: region.deliveryPriceInCents,
                  minOrderPriceInCents: region.minOrderPriceInCents,
                  deliveryWindow: region.deliveryWindow
                };
            } else {
              // Check for city/region based delivery
              if (region.coordinates && address.coordinates) {
                const distance = haversineDistance(address.coordinates, region.coordinates);
                logger.debug("deliveryProvider", `Distance to ${region.name}: ${distance.toFixed(2)} km`);
                
                if (distance < minDistance && region.ranges) {
                  const sortedRanges = [...region.ranges].sort((a, b) => a.range - b.range);

                  for (const range of sortedRanges) {
                    logger.debug("deliveryProvider", `Checking range: ${range.range} km with delivery price ${(range.deliveryPriceInCents / 100).toFixed(2)}€`);
                    logger.debug("deliveryProvider", `Min order price: ${range.minOrderPriceInCents} and min distance: ${range.range}`);
                    logger.debug("deliveryProvider", `Min price: ${minPrice} and min distance: ${minDistance}`);
                    if (range.minOrderPriceInCents <= minPrice && distance <= range.range) {
                      minPrice = range.minOrderPriceInCents;
                      closestRegion = region;
                      minDistance = distance;
                      applicableRange = range;
                      break;
                    }
                  }
                }
              }
            }
          }
          // 4. Determine if the address is within range and find the applicable pricing tier
          if (closestRegion && applicableRange) {
            logger.debug("deliveryProvider", `Found closest region: ${closestRegion.name} at ${minDistance.toFixed(2)} km`);
            logger.debug("deliveryProvider", `Found applicable range: ${applicableRange?.range} km with delivery price ${(applicableRange?.deliveryPriceInCents / 100).toFixed(2)}€`);
    
            if (applicableRange || closestRegion.isCountry) {
              // Address is within range - use the applicable range pricing or fall back to legacy pricing
              const deliveryPriceInCents = applicableRange?.deliveryPriceInCents || closestRegion.deliveryPriceInCents || 100000;
              const minOrderPriceInCents = applicableRange?.minOrderPriceInCents || closestRegion.minOrderPriceInCents || 100000;
      
              logger.debug("deliveryProvider", `Address is within delivery range. Using delivery price: ${deliveryPriceInCents / 100}€, min order: ${minOrderPriceInCents / 100}€`);
              
              setValidationResult({
                isValid: true,
                isInRange: true,
                message: `Address is within the '${closestRegion.name}' delivery zone.`,
                deliveryRegion: {
                  ...closestRegion,
                  ranges: [applicableRange]
                },
                validatedAddress: address,
              });
            } else {
              logger.debug("deliveryProvider", `Address is outside the nearest delivery zone (${minDistance.toFixed(2)} km away).`);
              
              setValidationResult({
                isValid: true,
                isInRange: false,
                message: `Address is outside our delivery area. Nearest location is ${minDistance.toFixed(1)} km away.`,
                validatedAddress: address,
              });
            }
          } else {
            setValidationResult({
              isValid: false,
              isInRange: false,
              message: "No delivery regions found for this store.",
              validatedAddress: address,
            });
          }
        } catch (error) {
          logger.error("deliveryProvider", "Error validating initial address:", { error });
          // Keep the default validation result if validation fails
        } finally {
          setIsValidating(false);
        }
      }
    };
    
    if (address && store?.id) {
      validateInitialAddress();
    }
  }, [store?.id, address, isDelivery]);
  

  // Initialize delivery mode
  useEffect(() => {
    const initDeliveryMode = async () => {
      await setDeliveryMode(initialDeliveryMode ? 'delivery' : 'pickup');
    };
    
    initDeliveryMode();
  }, []);
  
  // Load saved delivery date and time when in delivery mode
  useEffect(() => {
    const loadSavedDateTime = async () => {
      try {
        setIsLoadingDate(true);
        if (!store) return;
        
        if (isDelivery) {
          // For delivery mode
          if (validationResult.isInRange && validationResult.deliveryRegion?.name) {
            // Load delivery time with region name
            const { date, time } = await getDeliveryTime(store.id, validationResult.deliveryRegion.name);
            if (date && time) {
              const parsedDate = parseDateParams(`${date} ${time}`);
              setSelectedDate(parsedDate);
            } else {
              // If no delivery time is set, clear the selected date
              setSelectedDate(undefined);
            }
          } else {
            // If no valid delivery region yet, clear the selected date
            setSelectedDate(undefined);
          }
        } else {
          // For pickup mode - load regardless of delivery validation status
          const { date, time } = await getOrderTime(store.id);
          if (date && time) {
            const parsedDate = parseDateParams(`${date} ${time}`);
            setSelectedDate(parsedDate);
          } else {
            // If no pickup time is set, clear the selected date
            setSelectedDate(undefined);
          }
        }
      } catch (error) {
        logger.error('deliveryProvider', 'Error loading saved time:', { error });
        // Clear selected date on error
        setSelectedDate(undefined);
      } finally {
        setIsLoadingDate(false);
      }
    };
    
    // Always load date/time when isDelivery changes
    loadSavedDateTime();
  }, [isDelivery, store?.id, validationResult.isInRange, validationResult.deliveryRegion?.name]);
  
  
  // Toggle delivery mode
  const toggleDeliveryMode = async (value: boolean) => {
    // Skip if we're already toggling or if the value didn't change
    if (isTogglingDelivery || value === isDelivery) return;

    setIsTogglingDelivery(true);
    await removeAllSchedules();
    setSelectedDate(undefined);
    setIsDelivery(value);
    await setDeliveryMode(value ? 'delivery' : 'pickup');
    setIsTogglingDelivery(false);
  };
  
  // Handle date change
  const handleDateChange = async (newDate: CalendarDateTime | CalendarDate) => {
    if (!store) return;

    if (newDate instanceof CalendarDate) {
      setSelectedDate(newDate);
    } else {
      const { date, time } = parseDateTime(newDate);
      if (date && time) {
        const parsedDate = parseDateParams(`${date} ${time}`);
        setSelectedDate(parsedDate);
        setIsDateUpdating(true);
        
        try {
          if (isDelivery && validationResult.deliveryRegion?.name) {
            // Update delivery time with the delivery region name
            await updateDeliveryTime(store.id, date, time, validationResult.deliveryRegion.name);
          } else {
            // Update pickup time
            await updateOrderTime(store.id, date, time);
          }
          
          addToast({
            description: isDelivery ? "Delivery time selected" : "Pickup time selected",
            color: "success",
            shouldShowTimeoutProgress: true,
            timeout: 1000,
          });
        } catch (error) {
          logger.error('deliveryProvider', 'Error updating time:', { error });
          addToast({
            description: "Error updating time",
            color: "danger",
            shouldShowTimeoutProgress: true,
            timeout: 3000,
          });
        } finally {
          setIsDateUpdating(false);
        }
      }
      setSelectedDate(newDate);
    }
  };

  // Function to save delivery address (UPDATED IMPLEMENTATION USING SERVER-SIDE VALIDATION)
  const handleAddressSubmit = async (
      addressData: ExtendedDeliveryAddressRaw
  ): Promise<void> => {
    
    deliveryAddressModal.handleSubmitStart();
    setIsValidating(true);

    try {
      const response = await saveDeliveryAddress(addressData);
      if (response.success) {
        setAddress(addressData);
        deliveryAddressModal.handleSubmitEnd(true);
      } else {
        logger.error('deliveryProvider', 'Error saving delivery address:', { error: response.error });
        deliveryAddressModal.handleSubmitEnd(false);
      }
    } catch (error) {
      logger.error('deliveryProvider', 'Error saving delivery address:', { error });
      deliveryAddressModal.handleSubmitEnd(false);
    } finally {
      setIsValidating(false);
    }
  };


  return (
    <DeliveryContext.Provider
      value={{
        // Delivery mode state
        isDelivery,
        isTogglingDelivery,
        toggleDeliveryMode,
        
        // Date selection
        selectedDate,
        isLoadingDate,
        isDateUpdating,
        minLeadTimeProduct,
        setMinLeadTimeProduct,
        handleDateChange,
        setSelectedDate,

        // Address management
        address,
        handleAddressSubmit,
        
        // Address validation
        validationResult,
        isValidating,

        // Delivery address modal
        deliveryAddressModal,

      }}
    >
      {children}
    </DeliveryContext.Provider>
  );
};

