import {getCurrentStore} from "@/lib/api/store-api";
import {Metadata} from "next";
import {getLocale} from "next-intl/server";
import {getCurrentSession} from "@/lib/actions/session";
import {redirect} from "next/navigation";

/**
 * Generate basic store metadata for pages
 */
export async function generateStorePageMetadata(
    id: string,
    pageTitle: string = '',
    pageDescription: string = '',
    robotsConfig = { index: true, follow: true }
): Promise<Metadata> {
    const storeData = await getCurrentStore(id);
    
    if (!storeData) {
        return {
            title: "Store Not Found",
            description: "The requested store could not be found."
        };
    }
    
    const title = pageTitle ? 
        `${pageTitle} | ${storeData.ownerName}` : 
        `${storeData.ownerName}`;
        
    const description = pageDescription || 
        `Order fresh, artisanal baked goods from ${storeData.ownerName}. Handcrafted with care and delivered to your door.`;
    
    return {
        title,
        description: description.substring(0, 160),
        robots: robotsConfig
    };
}

/**
 * Verify store exists and return the store data
 * Returns null if store doesn't exist
 */
export async function verifyStoreExists(id: string) {
    const storeData = await getCurrentStore(id);
    
    if (!storeData) {
        return null;
    }
    
    return storeData;
}

/**
 * Verify store exists and user has access to it
 * Redirects to auth page if not authenticated
 * Returns null if user doesn't have access to store
 */
export async function verifyStoreAccess(id: string) {
    const storeData = await getCurrentStore(id);
    
    if (!storeData) {
        return null;
    }
    
    const session = await getCurrentSession();
    
    if (!session?.user || session.user.id !== storeData.user_id) {
        if (!session?.user) {
            redirect('/auth');
        }
        return null;
    }
    
    return storeData;
}

/**
 * Get localized terms for the store based on the current locale
 */
export async function getStoreLocalizedTerms() {
    const locale = await getLocale();
    
    if (locale === 'nl') {
        return {
            bakery: "Bakkerij",
            artisanal: "Ambachtelijke",
            freshBread: "Vers brood",
            delivery: "Bezorging",
            pickup: "Afhalen",
        };
    }
    
    return {
        bakery: "Bakery",
        artisanal: "Artisanal",
        freshBread: "Fresh bread",
        delivery: "Delivery",
        pickup: "Pickup",
    };
} 