"use server";
import { cookies } from 'next/headers';

/**
 * COOKIE CONSENT AND PREFERENCES MANAGEMENT
 * 
 * Purpose: Store user consent preferences for different types of cookies 
 * Data stored: Consent status (accepted/rejected/partial) and specific preferences for cookie categories
 * Retention: 30 days
 * Legal basis: Consent - GDPR Article 6(1)(a)
 * Note: Only necessary cookies are enabled by default, others require explicit consent
 */

export interface CookiePreferences {
    necessary: boolean;
    analytics: boolean;
    marketing: boolean;
}

const MAX_AGE = 60 * 60 * 24 * 30; // 30 days
const COOKIE_CONSENT_KEY = "cookie_consent";
const COOKIE_PREFERENCES_KEY = "cookie_preferences";

/**
 * Check if the user has provided cookie consent
 * @returns boolean indicating whether consent has been given
 */
export async function isCookieConsentFromServer() {
    const cookieStore = await cookies();
    const consent = cookieStore.get(COOKIE_CONSENT_KEY)?.value ?? null;
    const preferences = cookieStore.get(COOKIE_PREFERENCES_KEY)?.value ?? null;
    return !!(consent && preferences);
}

/**
 * Get the user's cookie preferences
 * @returns CookiePreferences object or null if not set
 */
export async function getCookiePreferences(): Promise<CookiePreferences | null> {
    const cookieStore = await cookies();
    const preferences = cookieStore.get(COOKIE_PREFERENCES_KEY)?.value ?? null;
    return preferences ? JSON.parse(preferences) : null;
}

/**
 * Accept all cookie categories
 */
export async function acceptAll() {
    const cookieStore = await cookies();
    cookieStore.set(COOKIE_CONSENT_KEY, "accepted", {
        path: '/',
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: MAX_AGE,
    });
    cookieStore.set(
        COOKIE_PREFERENCES_KEY,
        JSON.stringify({
            necessary: true,
            analytics: true,
            marketing: true,
        }),
        {
            path: '/',
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: MAX_AGE,
        }
    );
}

/**
 * Reject all optional cookie categories (only necessary cookies remain enabled)
 */
export async function rejectAll() {
    const cookieStore = await cookies();
    cookieStore.set(COOKIE_CONSENT_KEY, "rejected",
        {
            path: '/',
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: MAX_AGE,
        });
    cookieStore.set(
        COOKIE_PREFERENCES_KEY,
        JSON.stringify({
            necessary: true,
            analytics: false,
            marketing: false,
        }),
        {
            path: '/',
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: MAX_AGE,
        }
    );
}

/**
 * Save user's specific cookie preferences
 * @param newPreferences - The user's selected preferences for each cookie category
 */
export async function savePreferences(newPreferences: CookiePreferences) {
    const cookieStore = await cookies();
    const { analytics, marketing } = newPreferences;
    
    // Set consent status based on preferences
    const consentStatus = analytics || marketing ? "partial" : "rejected";
    
    cookieStore.set(COOKIE_CONSENT_KEY, consentStatus, {
        path: '/',
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: MAX_AGE,
    });
    
    cookieStore.set(
        COOKIE_PREFERENCES_KEY,
        JSON.stringify({
            necessary: true, // Necessary cookies are always enabled
            analytics: analytics,
            marketing: marketing,
        }),
        {
            path: '/',
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: MAX_AGE,
        }
    );
}

/**
 * Remove all cookie consent and preferences
 */
export async function removeCookieConsent() {
    const cookieStore = await cookies();
    cookieStore.delete(COOKIE_CONSENT_KEY);
    cookieStore.delete(COOKIE_PREFERENCES_KEY);
}
