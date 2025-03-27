import {CalendarDate, CalendarDateTime, getLocalTimeZone} from '@internationalized/date';
import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'
import {format} from "date-fns";
import {DeliveryLocation} from "@/lib/actions/store";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const calculateTax = (amount: number, taxRate: number = 9) => {
    const divider = 100 + taxRate;
    return amount * taxRate / divider;
}

export const formatCurrency = (amount: number) => {
  return (amount / 100).toLocaleString('en-GB', {
    style: 'currency',
    currency: 'EUR',
  });
};

// Convert scheduled_time object to CalendarDateTime
export function scheduledToCalendarDateTime(scheduled: { date: string, time: string }): CalendarDateTime {
  try {
    const [year, month, day] = scheduled.date.split('-').map(Number);
    const [hour, minute] = scheduled.time.split(':').map(Number);
    return new CalendarDateTime(year, month, day, hour, minute);
  } catch (e) {
    console.error("Error parsing scheduled time:", e);
    return new CalendarDateTime(1970, 1, 1, 0, 0);
  }
}


export function formatDisplayDateTime(dateInput: string | Date | CalendarDate | CalendarDateTime, locale: string): string {
  try {
    let date: Date;

    if (dateInput instanceof CalendarDate) {
      date = dateInput.toDate(getLocalTimeZone());
    } else if (dateInput instanceof CalendarDateTime) {
      date = dateInput.toDate(getLocalTimeZone());
    } else {
      date = typeof dateInput === 'string' ? new Date(dateInput) : dateInput;
    }

    return date.toLocaleString(locale, {
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  } catch (e) {
    console.error("Error formatting datetime:", e);
    return "Invalid date";
  }
}

export function formatDisplayYearDate(dateInput: string | Date | CalendarDate | CalendarDateTime, locale: string): string {
  try {
    let date: Date;

    if (dateInput instanceof CalendarDate) {
      date = dateInput.toDate(getLocalTimeZone());
    } else if (dateInput instanceof CalendarDateTime) {
      date = dateInput.toDate(getLocalTimeZone());
    } else {
      date = typeof dateInput === 'string' ? new Date(dateInput) : dateInput;
    }

    return date.toLocaleString(locale, {
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    });
  } catch (e) {
    console.error("Error formatting date:", e);
    return "Invalid date";
  }
}

export function formatDisplayDate(dateInput: string | Date | CalendarDate | CalendarDateTime, locale: string): string {
  try {
    let date: Date;

    if (dateInput instanceof CalendarDate) {
      date = dateInput.toDate(getLocalTimeZone());
    } else if (dateInput instanceof CalendarDateTime) {
      date = dateInput.toDate(getLocalTimeZone());
    } else {
      date = typeof dateInput === 'string' ? new Date(dateInput) : dateInput;
    }

    return date.toLocaleString(locale, {
      month: 'long',
      day: 'numeric'
    });
  } catch (e) {
    console.error("Error formatting date:", e);
    return "Invalid date";
  }
}

export function formatDisplayTime(dateInput: string | Date | CalendarDateTime, locale: string): string {
  try {
    let date: Date;

    if (dateInput instanceof CalendarDateTime) {
      date = dateInput.toDate(getLocalTimeZone());
    } else {
      date = typeof dateInput === 'string' ? new Date(dateInput) : dateInput;
    }

    return date.toLocaleString(locale, {
      hour: '2-digit',
      minute: '2-digit'
    });
  } catch (e) {
    console.error("Error formatting time:", e);
    return "Invalid time";
  }
}

export const formatApiDate = (date: Date) => {
  return format(date, 'yyyy-M-dd');
};

// Format scheduled_time object directly
export function formatScheduledDate(scheduled: { date: string, time: string }, locale: string): string {
  const dateTime = scheduledToCalendarDateTime(scheduled);
  return formatDisplayDate(dateTime, locale);
}

export function formatScheduledDateTime(scheduled: { date: string, time: string }, locale: string): string {
  const dateTime = scheduledToCalendarDateTime(scheduled);
  return formatDisplayDateTime(dateTime, locale);
}

export function formatScheduledTime(scheduled: { date: string, time: string }, locale: string): string {
  const dateTime = scheduledToCalendarDateTime(scheduled);
  return formatDisplayTime(dateTime, locale);
}



export function generateRandomOTP(): string {
    const randomValues = new Uint8Array(6);
    crypto.getRandomValues(randomValues);

    // Convert each byte to a digit (0-9) and join them to form a 6-digit string.
    let otp = "";
    for (const byte of randomValues) {
        otp += (byte % 10).toString();
    }
    return otp;
}

/**
 * Checks if the cart total meets the minimum order price for a delivery region
 * @param deliveryLocationName - The name of the delivery location
 * @param deliveryLocations - Array of delivery locations
 * @param cartTotal - Total amount of the cart in cents
 * @returns An object with isValid and message properties
 */
export function validateMinOrderPrice(
  deliveryLocationName: string | null, 
  deliveryLocations: DeliveryLocation[], 
  cartTotal: number
): { isValid: boolean; message: string } {
  // If no delivery location selected, validation passes
  if (!deliveryLocationName) {
    return { isValid: true, message: '' };
  }
  
  // Find the selected delivery location
  const deliveryLocation = deliveryLocations.find(
    location => location.name === deliveryLocationName
  );
  
  // If the location doesn't exist, validation passes
  if (!deliveryLocation) {
    return { isValid: true, message: '' };
  }
  
  // Check if the cart total meets the minimum order price
  if (cartTotal < deliveryLocation.minOrderPriceInCents) {
    const minPrice = formatCurrency(deliveryLocation.minOrderPriceInCents);
    return { 
      isValid: false, 
      message: `Minimum order amount for delivery to ${deliveryLocationName} is ${minPrice}` 
    };
  }
  
  return { isValid: true, message: '' };
}

/**
 * Gets the delivery price for a specific location and optionally a specific strategy
 * @param deliveryLocationName - The name of the delivery location
 * @param deliveryLocations - Array of delivery locations
 * @param strategyId - Optional strategy ID to use for pricing
 * @returns The delivery price in cents or null if the location is not found
 */
export function getDeliveryPrice(
  deliveryLocationName: string | null, 
  deliveryLocations: DeliveryLocation[],
  strategyId?: string
): number | null {
  // If no delivery location selected, return null
  if (!deliveryLocationName) {
    return null;
  }
  
  // Find the selected delivery location
  const deliveryLocation = deliveryLocations.find(
    location => location.name === deliveryLocationName
  );
  
  // If the location doesn't exist, return null
  if (!deliveryLocation) {
    return null;
  }
  
  // Otherwise, return the default delivery price for this location
  return deliveryLocation.priceInCents;
}
