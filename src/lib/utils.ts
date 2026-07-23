/**
 * @fileoverview General-purpose utility functions shared across the application.
 *
 * Contains the cn class-name merger (clsx + tailwind-merge), Haversine distance
 * calculation, VAT and EUR currency helpers, converters and locale-aware
 * formatters for dates, times, and scheduled_time objects (built on
 * @internationalized/date), an API date formatter, and a cryptographically
 * random 6-digit OTP generator.
 */
import {CalendarDate, CalendarDateTime, getLocalTimeZone} from '@internationalized/date';
import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'
import {format} from "date-fns";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// --- Helper function for distance calculation (Haversine formula) ---
export const haversineDistance = (coords1: { lat: number; lng: number }, coords2: { lat: number; lng: number }): number => {
  const R = 6371; // Radius of the Earth in kilometers
  const dLat = (coords2.lat - coords1.lat) * Math.PI / 180;
  const dLng = (coords2.lng - coords1.lng) * Math.PI / 180;
  const lat1 = coords1.lat * Math.PI / 180;
  const lat2 = coords2.lat * Math.PI / 180;

  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.sin(dLng / 2) * Math.sin(dLng / 2) * Math.cos(lat1) * Math.cos(lat2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c; // Distance in kilometers
};

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

/**
 * Converts total minutes to an object with days, hours, and minutes components
 * @param totalMinutes - Total number of minutes to convert
 * @returns An object with days, hours, minutes, and a formatted string representation
 */
export const convertMinutesToTimeComponents = (totalMinutes: number) => {
  const days = Math.floor(totalMinutes / (24 * 60));
  const remainingMinutes = totalMinutes % (24 * 60);
  const hours = Math.floor(remainingMinutes / 60);
  const minutes = remainingMinutes % 60;
  
  return {
    days,
    hours,
    minutes,
    formatted: formatTimeComponents(days, hours, minutes)
  };
};

/**
 * Formats days, hours, and minutes into a readable string
 * @param days - Number of days
 * @param hours - Number of hours
 * @param minutes - Number of minutes
 * @returns Formatted string (e.g., "2 days 5 hours", "1 day", "3 hours 30 minutes")
 */
export const formatTimeComponents = (days: number, hours: number, minutes: number): string => {
  const parts: string[] = [];
  
  if (days > 0) {
    parts.push(`${days} ${days === 1 ? 'day' : 'days'}`);
  }
  
  if (hours > 0) {
    parts.push(`${hours} ${hours === 1 ? 'hour' : 'hours'}`);
  }
  
  if (minutes > 0 && days === 0) { // Only show minutes if less than a day
    parts.push(`${minutes} ${minutes === 1 ? 'minute' : 'minutes'}`);
  }
  
  return parts.join(' ');
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
