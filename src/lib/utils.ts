import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const formatCurrency = (amount: number) => {
  return (amount / 100).toLocaleString('en-GB', {
    style: 'currency',
    currency: 'EUR',
  });
};

export function formatDisplayDateTime(dateString: string, local: string): string {

    const date = new Date(dateString);
    const options: Intl.DateTimeFormatOptions = {
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    };
    return date.toLocaleString(local, options);
}

export function formatDisplayDate(dateString: string | Date, local: string): string {

    const date = new Date(dateString);
    const options: Intl.DateTimeFormatOptions = {
        month: 'long',
        day: 'numeric'
    };
    return date.toLocaleString(local, options);
}

export function formatDisplayTime(dateString: string | Date, local: string): string {

    const date = new Date(dateString);
    const options: Intl.DateTimeFormatOptions = {
        hour: '2-digit',
        minute: '2-digit'
    };
    return date.toLocaleString(local, options);
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
