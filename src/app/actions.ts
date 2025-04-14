"use server";

import {globalPOSTRateLimit} from "@/lib/actions/requests";
import {deleteSessionTokenCookie, getCurrentSession, invalidateSession} from "@/lib/actions/session";
import {revalidateTag} from "next/cache";
import {getTranslations} from "next-intl/server";
import { cookies } from 'next/headers';

export async function logoutAction(): Promise<ActionResult> {
    const t = await getTranslations("app/actions");

    if (!await globalPOSTRateLimit()) {
        return {
            message: t("tooManyRequests")
        };
    }
    const { session } = await getCurrentSession();
    if (session === null) {
        return {
            message: t("notAuthenticated")
        };
    }
    await invalidateSession(session.id);
    await deleteSessionTokenCookie();
    revalidateTag('session');

    return null;
}

import { revalidatePath } from 'next/cache';

export async function revalidateAndNavigate(path: string) {
    revalidatePath(path);
}

/**
 * Stores coordinates in secure HTTP-only cookies for search functionality
 * @param coordinates - The latitude and longitude coordinates
 * @param city - The city associated with the coordinates
 * @returns ActionResult indicating success or failure
 */
export async function storeCoordinatesInCookies(
    coordinates: { lat: number; lng: number },
    city?: string
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

        return null; // Success
    } catch (error) {
        console.error("Error storing coordinates:", error);
        return {
            message: "Failed to store coordinates. Please try again."
        };
    }
}

export type ActionResult = { message: string } | null;
