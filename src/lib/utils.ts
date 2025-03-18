
import {CalendarDate, CalendarDateTime, getLocalTimeZone} from '@internationalized/date';
import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'
import {format} from "date-fns";

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

// Convert a string date to CalendarDate
export function toCalendarDate(dateString: string): CalendarDate {
  try {
    // Try ISO format (YYYY-MM-DD)
    if (dateString.includes('-')) {
      const [year, month, day] = dateString.split('-').map(Number);
      return new CalendarDate(year, month, day);
    }

    // Fallback to native Date parsing
    const date = new Date(dateString);
    return new CalendarDate(
        date.getFullYear(),
        date.getMonth() + 1,
        date.getDate()
    );
  } catch (e) {
    console.error("Error parsing date:", e);
    return new CalendarDate(1970, 1, 1); // Fallback
  }
}

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
