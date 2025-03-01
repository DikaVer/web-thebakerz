"use server";
import { cookies } from 'next/headers';

export interface CookiePreferences {
    necessary: boolean;
    analytics: boolean;
    marketing: boolean;
}

export async function isCookieConsentFromServer() {
    const cookie = await cookies();
    const consent = cookie.get('cookie_consent')?.value ?? null;
    const preferences = cookie.get('cookie_preferences')?.value ?? null;
    return consent && preferences;
}

const COOKIE_CONSENT_KEY = "cookie_consent";
const COOKIE_PREFERENCES_KEY = "cookie_preferences";


export async function acceptAll() {
    const cookie = await cookies();
    cookie.set(COOKIE_CONSENT_KEY, "accepted", { expires: 365 });
    cookie.set(
        COOKIE_PREFERENCES_KEY,
        JSON.stringify({
            necessary: true,
            analytics: true,
            marketing: true,
        }),
        { expires: 365 }
    );
    // Optionally, return a value or trigger a redirect
}

export async function rejectAll() {
    const cookie = await cookies();
    cookie.set(COOKIE_CONSENT_KEY, "rejected", { expires: 365 });
    cookie.set(
        COOKIE_PREFERENCES_KEY,
        JSON.stringify({
            necessary: true,
            analytics: false,
            marketing: false,
        }),
        { expires: 365 }
    );
}

export async function savePreferences(newPreferences: CookiePreferences) {
    const cookie = await cookies();
    cookie.set(
        COOKIE_PREFERENCES_KEY,
        JSON.stringify(newPreferences),
        { expires: 365 }
    );
    const { analytics, marketing } = newPreferences;
    if (analytics || marketing) {
        cookie.set(COOKIE_CONSENT_KEY, "partial", { expires: 365 });
    } else {
        cookie.set(COOKIE_CONSENT_KEY, "rejected", { expires: 365 });
    }
}
