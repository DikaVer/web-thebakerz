"use server";

import { cookies } from 'next/headers';

/**
 * DELIVERY MODE COOKIE HANDLING
 * 
 * Purpose: Store user's preference for delivery or pickup method
 * Data stored: Selected delivery mode ('pickup' or 'delivery')
 * Retention: 30 days
 * Legal basis: Legitimate interest - remembering user preferences for order fulfillment
 * Note: This preference is stored locally and not shared with third parties
 */

const DELIVERY_MODE_COOKIE = "deliveryMode";
const SEARCH_LAT_KEY = "search_lat";
const SEARCH_LNG_KEY = "search_lng";
const SEARCH_CITY_KEY = "search_city";
const SEARCH_COUNTRY_KEY = "search_country";

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
    return (cookieStore.get(DELIVERY_MODE_COOKIE)?.value as DeliveryMode) || 'pickup';
}

/**
 * Removes the delivery mode cookie
 */
export async function removeDeliveryMode(): Promise<void> {
    const cookieStore = await cookies();
    cookieStore.delete(DELIVERY_MODE_COOKIE);
}

/**
 * LOCATION SEARCH COOKIE HANDLING
 * 
 * Purpose: Store user's location preferences for store and product searches
 * Data stored: Geographic coordinates (latitude/longitude), city name, and country
 * Retention: 24 hours
 * Legal basis: Legitimate interest - providing location-based search functionality
 * Note: This data is stored locally and not shared with third parties
 */

/**
 * Get saved search coordinates from cookies
 * @returns Coordinates if available, null otherwise
 */
export async function getSearchCoordinates(): Promise<Coordinates | null> {
    const cookieStore = await cookies();
    const lat = cookieStore.get(SEARCH_LAT_KEY)?.value;
    const lng = cookieStore.get(SEARCH_LNG_KEY)?.value;
    
    if (!lat || !lng) {
        return null;
    }
    
    try {
        return {
            lat: parseFloat(lat),
            lng: parseFloat(lng)
        };
    } catch (error) {
        console.error("Error parsing coordinates from cookies:", error);
        return null;
    }
}

/**
 * Get saved search city from cookies
 * @returns City name if available, null otherwise
 */
export async function getSearchCity(): Promise<string | null> {
    const cookieStore = await cookies();
    return cookieStore.get(SEARCH_CITY_KEY)?.value ?? null;
}

/**
 * Get saved search country from cookies
 * @returns Country code if available, null otherwise
 */
export async function getSearchCountry(): Promise<string | null> {
    const cookieStore = await cookies();
    return cookieStore.get(SEARCH_COUNTRY_KEY)?.value ?? null;
}

/**
 * Stores coordinates in secure HTTP-only cookies for search functionality
 * @param coordinates - The latitude and longitude coordinates
 * @param city - The city associated with the coordinates
 * @param country - The country associated with the coordinates
 */
export async function setSearchLocation(
    coordinates: Coordinates,
    city?: string,
    country?: string
): Promise<void> {
    const cookieStore = await cookies();
    
    // Store coordinates
    cookieStore.set(SEARCH_LAT_KEY, coordinates.lat.toString(), {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        maxAge: 60 * 60 * 24, // 24 hours
        path: '/',
        sameSite: 'strict'
    });
    
    cookieStore.set(SEARCH_LNG_KEY, coordinates.lng.toString(), {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        maxAge: 60 * 60 * 24, // 24 hours
        path: '/',
        sameSite: 'strict'
    });

    // Store city if provided
    if (city) {
        cookieStore.set(SEARCH_CITY_KEY, city, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            maxAge: 60 * 60 * 24, // 24 hours
            path: '/',
            sameSite: 'strict'
        });
    }

    // Store country if provided
    if (country) {
        cookieStore.set(SEARCH_COUNTRY_KEY, country, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            maxAge: 60 * 60 * 24, // 24 hours
            path: '/',
            sameSite: 'strict'
        });
    }
}

/**
 * Removes all location search cookies
 */
export async function removeSearchLocation(): Promise<void> {
    const cookieStore = await cookies();
    cookieStore.delete(SEARCH_LAT_KEY);
    cookieStore.delete(SEARCH_LNG_KEY);
    cookieStore.delete(SEARCH_CITY_KEY);
    cookieStore.delete(SEARCH_COUNTRY_KEY);
} 