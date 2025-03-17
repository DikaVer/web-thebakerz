"use server";
import { cookies } from 'next/headers';

export interface CookiePreferences {
    necessary: boolean;
    analytics: boolean;
    marketing: boolean;
}
const COOKIE_CONSENT_KEY = "cookie_consent";
const COOKIE_PREFERENCES_KEY = "cookie_preferences";

export async function isCookieConsentFromServer() {
    const cookie = await cookies();
    const consent = cookie.get(COOKIE_CONSENT_KEY)?.value ?? null;
    const preferences = cookie.get(COOKIE_PREFERENCES_KEY)?.value ?? null;
    return !!(consent && preferences);
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
    } else {
        cookie.set(COOKIE_CONSENT_KEY, "rejected", {
            path: '/', // makes the cookie available on the entire site
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 60 * 60 * 24 * 1, // 1 days
        });
    }
}
