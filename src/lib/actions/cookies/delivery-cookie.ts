/**
 * @fileoverview Server actions for delivery-mode and rescue-deal cookies.
 *
 * Stores the user's preferred fulfillment method ('pickup' or 'delivery') in
 * an httpOnly cookie with 30-day retention, and a short-lived (1 hour)
 * rescue-deal mode flag. Provides set/get/remove helpers for both cookies;
 * the preference is stored locally and not shared with third parties.
 */
"use server";

import { cookies } from 'next/headers';

const DELIVERY_MODE_COOKIE = "deliveryMode";
const RESCUE_DEAL_MODE_COOKIE = "rescueDealMode";

export type DeliveryMode = 'pickup' | 'delivery';

export interface Coordinates {
    lat: number;
    lng: number;
}

/**
 * Sets the user's preferred delivery mode (pickup or delivery)
 * @param mode - The delivery mode to set
 */
export async function setDeliveryMode(mode: DeliveryMode) {
    const cookieStore = await cookies();
    cookieStore.set(DELIVERY_MODE_COOKIE, mode, {
        path: '/',
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict', // Changed from 'lax' to 'strict' for better security
        maxAge: 30 * 24 * 60 * 60, // 30 days
    });
}

/**
 * Retrieves the user's preferred delivery mode
 * @returns The stored delivery mode or 'pickup' as default
 */
export async function getDeliveryMode(): Promise<DeliveryMode> {
    const cookieStore = await cookies();
    return (cookieStore.get(DELIVERY_MODE_COOKIE)?.value as DeliveryMode) || 'delivery';
}

/**
 * Removes the delivery mode cookie
 */
export async function removeDeliveryMode(): Promise<void> {
    const cookieStore = await cookies();
    cookieStore.delete(DELIVERY_MODE_COOKIE);
}

/**
 * Sets the user's preferred rescue deal mode
 * @param mode - The rescue deal mode to set
 */
export async function setRescueDealMode(mode: boolean) {
    const cookieStore = await cookies();
    cookieStore.set(RESCUE_DEAL_MODE_COOKIE, mode.toString(), {
        path: '/',
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 1 * 60 * 60, // 1 hour
    });
}

/**
 * Retrieves the user's preferred rescue deal mode
 * @returns The stored rescue deal mode or false as default
 */
export async function getRescueDealMode(): Promise<boolean> {
    const cookieStore = await cookies();
    return cookieStore.get(RESCUE_DEAL_MODE_COOKIE)?.value === 'true' || false;
}   

/**
 * Removes the rescue deal mode cookie
 */
export async function removeRescueDealMode(): Promise<void> {
    const cookieStore = await cookies();
    cookieStore.delete(RESCUE_DEAL_MODE_COOKIE);
}