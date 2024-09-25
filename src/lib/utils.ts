import { clsx, type ClassValue } from 'clsx'
import { customAlphabet } from 'nanoid'
import { twMerge } from 'tailwind-merge'
import {AddressDataField} from "@/lib/definitions";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function createNanoid(length: number) {
  const nanoid = customAlphabet('0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz', length)
  return nanoid();
}


export function formatAddress(address: AddressDataField): string {
    return [
        address.route,
        address.street_number,
        address.premise,
        address.subPremise,
        address.city
    ].filter(Boolean).join(' ').trim().replace(/\s+/g, ', ');
}



export const formatCurrency = (amount: number) => {
  return (amount / 100).toLocaleString('en-GB', {
    style: 'currency',
    currency: 'EUR',
  });
};


export function formatDate(input: string | number | Date): string {
  const date = new Date(input)
  return date.toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'numeric',
    year: 'numeric'
  })
}

export function formatDateTime(input: string | number | Date): string {
    const date = new Date(input)
    return date.toLocaleString('en-US', {
        hour: 'numeric',
        minute: 'numeric'
    })
}