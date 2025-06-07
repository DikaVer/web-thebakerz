"use server";

import {globalPOSTRateLimit} from "@/lib/utils/helper/requests";
import {deleteSessionTokenCookie, getCurrentSession, invalidateSession} from "@/lib/actions/session";
import {revalidateTag} from "next/cache";
import {getTranslations} from "next-intl/server";
import { cookies } from 'next/headers';
import { logger } from "@/lib/logger";
import { getRequestContext } from "@/lib/request-context";

// Initialize logger for actions
const log = logger.child({ module: "actions" });

export async function logoutAction(): Promise<ActionResult> {
    const t = await getTranslations("app/actions");
    const context = await getRequestContext();
    
    log.info('logoutAction', 'Logout attempt started', {
        requestId: context.requestId,
        clientIP: context.clientIP
    });

    if (!await globalPOSTRateLimit()) {
        log.warn('logoutAction', 'Rate limit hit during logout attempt', {
            requestId: context.requestId,
            clientIP: context.clientIP
        });
        return {
            message: t("tooManyRequests")
        };
    }
    
    const { session } = await getCurrentSession();
    if (session === null) {
        log.warn('logoutAction', 'Logout attempted without active session', {
            requestId: context.requestId,
            clientIP: context.clientIP
        });
        return {
            message: t("notAuthenticated")
        };
    }
    
    log.info('logoutAction', 'Valid session found, proceeding with logout', {
        requestId: context.requestId,
        clientIP: context.clientIP,
        userId: session.userId
    });
    
    await invalidateSession(session.id);
    await deleteSessionTokenCookie();
    revalidateTag('session');

    log.info('logoutAction', 'Logout completed successfully', {
        requestId: context.requestId,
        clientIP: context.clientIP,
        userId: session.userId,
        sessionId: session.id
    });

    return null;
}

import { revalidatePath } from 'next/cache';

export async function revalidateAndNavigate(path: string) {
    revalidatePath(path);
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
 * Stores coordinates in secure HTTP-only cookies for search functionality
 * @param coordinates - The latitude and longitude coordinates
 * @param city - The city associated with the coordinates
 * @param country - The country associated with the coordinates
 * @returns ActionResult indicating success or failure
 */
export async function storeCoordinatesInCookies(
    coordinates: { lat: number; lng: number },
    city?: string,
    country?: string
): Promise<ActionResult> {
    try {
        if (!await globalPOSTRateLimit()) {
            return {
                message: "Too many requests. Please try again later."
            };
        }

        // Validate the coordinates
        const { lat, lng } = coordinates;
        if (typeof lat !== 'number' || typeof lng !== 'number' || 
            isNaN(lat) || isNaN(lng) || 
            lat < -90 || lat > 90 || lng < -180 || lng > 180) {
            return {
                message: "Invalid coordinates provided."
            };
        }

        // Store coordinates in secure cookies (expires in 24 hours)
        const cookieStore = await cookies();
        cookieStore.set('search_lat', lat.toString(), {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            maxAge: 60 * 60 * 24, // 24 hours
            path: '/',
            sameSite: 'strict'
        });
        
        cookieStore.set('search_lng', lng.toString(), {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            maxAge: 60 * 60 * 24, // 24 hours
            path: '/',
            sameSite: 'strict'
        });

        // Store city if provided
        if (city) {
            cookieStore.set('search_city', city, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                maxAge: 60 * 60 * 24, // 24 hours
                path: '/',
                sameSite: 'strict'
            });
        }

        // Store country if provided
        if (country) {
            cookieStore.set('search_country', country, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                maxAge: 60 * 60 * 24, // 24 hours
                path: '/',
                sameSite: 'strict'
            });
        }

        return null; // Success
    } catch (error) {
        console.error("Error storing coordinates:", error);
        return {
            message: "Failed to store coordinates. Please try again."
        };
    }
}

/**
 * Removes all location search cookies
 */
export async function removeLocationCookies(): Promise<void> {
    try {
        const cookieStore = await cookies();
        cookieStore.delete('search_lat');
        cookieStore.delete('search_lng');
        cookieStore.delete('search_city');
        cookieStore.delete('search_country');
    } catch (error) {
        console.error("Error removing location cookies:", error);
    }
}

export type ActionResult = { message: string } | null;
