'use client';

import React, { createContext, useContext, ReactNode, useState, useEffect, useCallback } from 'react';
import { CalendarDateTime, CalendarDate } from "@internationalized/date";
import { setDeliveryMode} from '@/lib/delivery-cookie';
import { addToast } from "@heroui/react";
import { useStore } from '@/components/providers/store-provider';
import { updateOrderTime, getOrderTime, updateDeliveryTime, getDeliveryTime } from '@/app/(store)/[id]/actions';
import { DeliveryAddress as DbDeliveryAddress, DeliveryAddress, DeliveryAddressRaw } from '@/app/(store)/[id]/delivery-actions';
import { parseDateParams, parseDateTime } from "@/components/store/store-header/calendar/calendar-params";
import { MerchantDeliveryRegion, DeliveryRange } from '@/lib/actions/delivery-actions';
import { haversineDistance } from '@/lib/utils';
import { logger } from '@/lib/logger';

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
    isSubheaderLoaded: boolean;
    setSubheaderLoaded: (loaded: boolean) => void;
    
    // Date selection
    selectedDate: CalendarDateTime | CalendarDate | undefined;
    isLoadingDate: boolean;
    isDateUpdating: boolean;
    handleDateChange: (newDate: CalendarDateTime | CalendarDate) => Promise<void>;
    setSelectedDate: (newDate: CalendarDateTime | CalendarDate | undefined) => void;
    
    // Address management
    address: DeliveryAddressRaw | null;
    isAddressLoading: boolean;
    showDeliveryInfo: boolean;
    handleAddressSubmit: (addressData: DeliveryAddressRaw) => Promise<boolean>;
    modalSubmissionStatus: 'idle' | 'validating' | 'saving' | 'success' | 'error';
    resetModalStatus: (open: boolean) => void;
    
    // Address validation
    validationResult: ValidationResult;
    isValidating: boolean;
    
    // Map state
    isMapLoaded: boolean;
    setMapLoaded: (loaded: boolean) => void;
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
  const [isSubheaderLoaded, setIsSubheaderLoaded] = useState(true);
  
  // Date selection state
  const [selectedDate, setSelectedDate] = useState<CalendarDateTime | CalendarDate | undefined>(undefined);
  const [isLoadingDate, setIsLoadingDate] = useState(true);
  const [isDateUpdating, setIsDateUpdating] = useState(false);
  
  // Address state
  const [address, setAddress] = useState<DeliveryAddressRaw | null>(initialAddress);
  const [isAddressLoading, setIsAddressLoading] = useState(!initialAddress);
  const [showDeliveryInfo, setShowDeliveryInfo] = useState(!!initialAddress?.coordinates);
  const [modalSubmissionStatus, setModalSubmissionStatus] = useState<'idle' | 'validating' | 'saving' | 'success' | 'error'>('idle');
  
  // Map state
  const [isMapLoaded, setIsMapLoaded] = useState(false);
  
  // Validation state - set initial validation for pre-loaded address
  const [isValidating, setIsValidating] = useState(false);
  const [validationResult, setValidationResult] = useState<ValidationResult>({
    isValid: !!initialAddress?.coordinates,
    isInRange: !!initialAddress?.coordinates, // We assume a server-provided address is valid and in range
    message: initialAddress?.coordinates 
      ? "Delivery address loaded from your saved profile." 
      : "Please enter your delivery address.",
    validatedAddress: initialAddress ? initialAddress : undefined
  });
  
  // Validate initial address when component mounts
  useEffect(() => {
    const validateInitialAddress = async () => {
      if (initialAddress?.coordinates && store?.id) {
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
            if (region.isCountry && initialAddress.country && 
                region.minOrderPriceInCents && region.deliveryPriceInCents &&
                minPrice > region.minOrderPriceInCents &&
                region.name.toLowerCase() === initialAddress.country.toLowerCase()) {

                logger.debug("deliveryProvider", `Found country-wide delivery region: ${region.name}`);
                closestRegion = region;
                minPrice = region.minOrderPriceInCents;
                applicableRange = {
                  range: 0,
                  deliveryPriceInCents: region.deliveryPriceInCents,
                  minOrderPriceInCents: region.minOrderPriceInCents
                };
            } else {
              // Check for city/region based delivery
              if (region.coordinates && initialAddress.coordinates) {
                const distance = haversineDistance(initialAddress.coordinates, region.coordinates);
                logger.debug("deliveryProvider", `Distance to ${region.name}: ${distance.toFixed(2)} km`);
                
                if (distance < minDistance && region.ranges) {
                  const sortedRanges = [...region.ranges].sort((a, b) => a.range - b.range);

                  for (const range of sortedRanges) {
                    if (range.minOrderPriceInCents <= minPrice && minDistance <= range.range) {
                      minPrice = range.minOrderPriceInCents;
                      closestRegion = region;
                      minDistance = distance;
                      applicableRange = range;
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
                validatedAddress: initialAddress,
              });
            } else {
              logger.debug("deliveryProvider", `Address is outside the nearest delivery zone (${minDistance.toFixed(2)} km away).`);
              
              setValidationResult({
                isValid: true,
                isInRange: false,
                message: `Address is outside our delivery area. Nearest location is ${minDistance.toFixed(1)} km away.`,
                validatedAddress: initialAddress,
              });
            }
          } else {
            setValidationResult({
              isValid: false,
              isInRange: false,
              message: "No delivery regions found for this store.",
              validatedAddress: initialAddress,
            });
          }
        } catch (error) {
          logger.error("deliveryProvider", "Error validating initial address:", { error });
          // Keep the default validation result if validation fails
        } finally {
          setIsValidating(false);
          setIsAddressLoading(false);
        }
      }
    };
    
    if (initialAddress?.coordinates && store?.id) {
      validateInitialAddress();
    }
  }, [initialAddress as DbDeliveryAddress | null, store?.id]);
  
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
      addressData: DeliveryAddressRaw
  ): Promise<boolean> => {
    if (!store) return false;

    setModalSubmissionStatus('validating');
    setIsValidating(true);

    try {
      logger.debug("deliveryProvider", "Using server-side validation for address:", { address: addressData.formattedAddress });
      
      // Import the server action dynamically to prevent it from being included in the client bundle
      const { validateAndSaveAddress } = await import('@/lib/actions/delivery-address-actions');
      
      // Call the server action to validate and save the address
      const { validationResult, saveResult } = await validateAndSaveAddress(store.id, addressData);
      
      // Update the client-side validation result state
      setValidationResult(validationResult);
      
      // Handle validation and save results
      if (!validationResult.isValid) {
        addToast({ 
          description: validationResult.message || "Invalid address details.", 
          color: "danger" 
        });
        setModalSubmissionStatus('error');
        setIsValidating(false);
        return false;
      }

      if (!validationResult.isInRange) {
        addToast({ 
          description: validationResult.message || "Address is outside our delivery area.", 
          color: "warning", 
          timeout: 4000 
        });
        // Still show delivery info if address is valid but out of range
        setShowDeliveryInfo(true);
      } else {
        setShowDeliveryInfo(true);
        addToast({ 
          description: "Delivery address confirmed!", 
          color: "success", 
          timeout: 2000 
        });
      }
      
      // Check for save errors
      if (saveResult.error) {
        logger.error("deliveryProvider", "Error saving address:", { error: saveResult.error });
        addToast({ 
          description: `Error saving address: ${saveResult.error}`, 
          color: "danger" 
        });
        setModalSubmissionStatus('error');
        setIsValidating(false);
        return false;
      }
      
      // If we got here, address is at least valid (even if out of range)
      // Update the address state with the validated address
      if (validationResult.validatedAddress) {
        setAddress(validationResult.validatedAddress);
      } else {
        // Fallback to the original address if validation didn't provide a validated version
        // This should rarely happen
        setAddress(addressData);
      }

      // Success!
      setModalSubmissionStatus('success');
      setIsValidating(false);
      return validationResult.isValid; // Return validation status
      
    } catch (error) {
      logger.error("deliveryProvider", "Error in handleAddressSubmit:", { error });
      addToast({ 
        description: "An unexpected error occurred while validating the address.", 
        color: "danger" 
      });
      setModalSubmissionStatus('error');
      setIsValidating(false);
      return false;
    }
  };
  
  // Reset modal status when it's closed or opened
  const resetModalStatus = useCallback((open: boolean) => {
    if (!open) {
      // Delay resetting only if submission was in progress, allowing UI to settle
      const delay = modalSubmissionStatus !== 'idle' ? 300 : 0;
      setTimeout(() => {
        setModalSubmissionStatus('idle');
      }, delay);
    } else {
      setModalSubmissionStatus('idle'); // Reset immediately on open
    }
  }, [modalSubmissionStatus]);
  
  // Set subheader loaded state
  const setSubheaderLoaded = (loaded: boolean) => {
    if (loaded !== isSubheaderLoaded) {
      setIsSubheaderLoaded(loaded);
    }
  };
  
  // Set map loaded state
  const setMapLoaded = (loaded: boolean) => {
    setIsMapLoaded(loaded);
  };

  return (
    <DeliveryContext.Provider
      value={{
        // Delivery mode state
        isDelivery,
        isTogglingDelivery,
        toggleDeliveryMode,
        isSubheaderLoaded,
        setSubheaderLoaded,
        
        // Date selection
        selectedDate,
        isLoadingDate,
        isDateUpdating,
        handleDateChange,
        setSelectedDate,

        // Address management
        address,
        isAddressLoading,
        showDeliveryInfo,
        handleAddressSubmit,
        modalSubmissionStatus,
        resetModalStatus,
        
        // Address validation
        validationResult,
        isValidating,
        
        // Map state
        isMapLoaded,
        setMapLoaded
      }}
    >
      {children}
    </DeliveryContext.Provider>
  );
};

