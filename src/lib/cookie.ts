"use server";
import { cookies } from 'next/headers';
import clarity from "@microsoft/clarity";

export interface CookiePreferences {
    necessary: boolean;
    analytics: boolean;
    marketing: boolean;
}

export interface Coordinates {
    lat: number;
    lng: number;
}

const COOKIE_CONSENT_KEY = "cookie_consent";
const COOKIE_PREFERENCES_KEY = "cookie_preferences";
const SEARCH_LAT_KEY = "search_lat";
const SEARCH_LNG_KEY = "search_lng";

export async function isCookieConsentFromServer() {
    const cookie = await cookies();
    const consent = cookie.get(COOKIE_CONSENT_KEY)?.value ?? null;
    const preferences = cookie.get(COOKIE_PREFERENCES_KEY)?.value ?? null;
    return !!(consent && preferences);
}

export async function getCookiePreferences(): Promise<CookiePreferences | null> {
    const cookie = await cookies();
    const preferences = cookie.get(COOKIE_PREFERENCES_KEY)?.value ?? null;
    return preferences ? JSON.parse(preferences) : null;
}

/**
 * Get saved search coordinates from cookies
 * @returns Coordinates if available, null otherwise
 */
export async function getSearchCoordinates(): Promise<Coordinates | null> {
    const cookie = await cookies();
    const lat = cookie.get(SEARCH_LAT_KEY)?.value;
    const lng = cookie.get(SEARCH_LNG_KEY)?.value;
    
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

export async function acceptAll() {
    const cookie = await cookies();
    cookie.set(COOKIE_CONSENT_KEY, "accepted", {
        path: '/', // makes the cookie available on the entire site
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 1, // 1 days
    });
    cookie.set(
        COOKIE_PREFERENCES_KEY,
        JSON.stringify({
            necessary: true,
            analytics: true,
            marketing: true,
        }),
        {
            path: '/', // makes the cookie available on the entire site
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 60 * 60 * 24 * 1, // 1 days
        }
    );
    // Optionally, return a value or trigger a redirect
}

export async function rejectAll() {
    const cookie = await cookies();
    cookie.set(COOKIE_CONSENT_KEY, "rejected",
        {
            path: '/', // makes the cookie available on the entire site
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 60 * 60 * 24 * 1, // 1 days
        });
    cookie.set(
        COOKIE_PREFERENCES_KEY,
        JSON.stringify({
            necessary: true,
            analytics: false,
            marketing: false,
        }),
        {
            path: '/', // makes the cookie available on the entire site
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 60 * 60 * 24 * 1, // 1 days
        }
    );
}

export async function savePreferences(newPreferences: CookiePreferences) {
    const cookie = await cookies();
    cookie.set(
        COOKIE_PREFERENCES_KEY,
        JSON.stringify(newPreferences),
        {
            path: '/', // makes the cookie available on the entire site
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 60 * 60 * 24 * 1, // 1 days
        }
    );
    const { analytics, marketing } = newPreferences;
    if (analytics || marketing) {
        cookie.set(COOKIE_CONSENT_KEY, "partial", {
            path: '/', // makes the cookie available on the entire site
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 60 * 60 * 24 * 1, // 1 days
        });
        cookie.set(
            COOKIE_PREFERENCES_KEY,
            JSON.stringify({
                necessary: true,
                analytics: analytics,
                marketing: marketing,
            }),
            {
                path: '/', // makes the cookie available on the entire site
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'lax',
                maxAge: 60 * 60 * 24 * 1, // 1 days
            }
        );
    } else {
        cookie.set(COOKIE_CONSENT_KEY, "rejected", {
            path: '/', // makes the cookie available on the entire site
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 60 * 60 * 24 * 1, // 1 days
        });
        cookie.set(
            COOKIE_PREFERENCES_KEY,
            JSON.stringify({
                necessary: true,
                analytics: analytics,
                marketing: marketing,
            }),
            {
                path: '/', // makes the cookie available on the entire site
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'lax',
                maxAge: 60 * 60 * 24 * 1, // 1 days
            }
        );
    }
}
