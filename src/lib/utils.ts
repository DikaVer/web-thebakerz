import { clsx, type ClassValue } from 'clsx'
import { customAlphabet } from 'nanoid'
import { twMerge } from 'tailwind-merge'
import {AddressDataStoreField} from "@/lib/definitions";
import {Day, Time} from "@/lib/actions/calendar-actions";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function createNanoid(length: number) {
  const nanoid = customAlphabet('0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz', length)
  return nanoid();
}

//Calendar
export const createISOString = (day: Day, time: Time): string => {
    return `${day.year}-${String(day.month).padStart(2, '0')}-${String(day.day).padStart(2, '0')}T${String(time.hour).padStart(2, '0')}:${String(time.minute).padStart(2, '0')}:00`;
}


export function formatAddress(address: AddressDataStoreField): string {
    return [
        address.route,
        address.street_number,
        address.premise,
        address.sub_premise,
        address.city
    ].filter(Boolean).join(' ').trim().replace(/\s+/g, ', ');
}

export const formatCurrency = (amount: number) => {
  return (amount / 100).toLocaleString('en-GB', {
    style: 'currency',
    currency: 'EUR',
  });
};

export const formatCurrencyNormal = (amount: number) => {
    return (amount).toLocaleString('en-GB', {
        style: 'currency',
        currency: 'EUR',
    });
};

export const formatPrice = (amount: number) => {
    return (amount / 100)
};

export function formatDataDate(input: string | number | Date): string {
    const date = new Date(input)
    return date.toLocaleDateString('en-US', {
        month: '2-digit',
        day: '2-digit',
        year: 'numeric',
    })
}


export function formatDate(input: string | number | Date): string {
  const date = new Date(input)
  return date.toLocaleDateString('en-GB', {
      month: '2-digit',
      day: '2-digit',
      year: 'numeric',
  })
}

export function formatDateTime(input: string | number | Date): string {
    const date = new Date(input)
    return date.toLocaleString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
    })
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
