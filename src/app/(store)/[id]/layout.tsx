import '@/styles/globals.css'
import React from "react";
import {getCurrentStore} from "@/lib/actions/store";
import {getLocalizedMetadata, metadataTranslations} from "@/components/metadata";
import type {Metadata} from "next";
import {getLocale} from "next-intl/server";
import {StoreIdChecker} from "@/components/store/store-id-checker";
import {StoreProvider} from "@/components/providers/store-provider";
import {ProductDialogProvider} from "@/components/providers/product-provider";
import {CartProvider} from "@/components/providers/cart-provider";
import {getCurrentCart} from "@/lib/actions/cart";
import {getDeliveryMode} from "@/lib/actions/cookies/delivery-cookie";
import {DeliveryProvider} from "@/components/providers/delivery-provider";
import {getCurrentDeliveryAddress} from "@/app/(store)/[id]/delivery-actions";
import LayoutComp from "@/components/layout-comp";
import NotFound from "@/app/(error_layout)/not-found";
import { GoogleMapsProvider } from '@/components/providers/google-maps-provider';
import { FavoritesProvider } from '@/components/providers/favorites-provider';
import { getCurrentFavorites, getProductFavorites } from '@/lib/actions/favorites';

type Params = Promise<{ id: string }>

export async function generateMetadata({
                                           params,
                                       }: {
    params: Params,
}): Promise<Metadata> {
    const { id } = await params;
    const storeData = await getCurrentStore(id);
    const locale = await getLocale();

    // Get base localized metadata
    const localizedMetadata = getLocalizedMetadata(locale);
    // Determine locale key for consistency
    let localeKey: 'en' | 'nl' = 'en';
    if (locale === 'nl-NL' || locale === 'nl') {
        localeKey = 'nl';
    }
    const baseTranslations = metadataTranslations[localeKey]; // Get base translations for keywords

    if (!storeData) {
        return {
            title: "Store Not Found | TheBakerz",
            description: "The requested store could not be found."
        };
    }

    const storeName = storeData.ownerName || "TheBakerz Store";
    const storeDescription = storeData.description ||
    localeKey === 'nl'
        ? `Bestel verse, ambachtelijke bakkerijproducten van ${storeName}. Handgemaakt met zorg en aan uw deur geleverd.`
        : `Order fresh, artisanal baked goods from ${storeName}. Handcrafted with care and delivered to your door.`;

    const storeLocation = storeData.location ?
        `${storeData.location.city}, ${storeData.location.country}` : '';

    // Create location-based keywords if available
    const locationKeywords = storeLocation
        ? localeKey === 'nl'
            ? `bakkerij in ${storeLocation}, ${storeData.location?.city} bakkerij, ambachtelijke bakkerij ${storeData.location?.city}`
            : `bakery in ${storeLocation}, ${storeData.location?.city} bakery, artisanal bakery ${storeData.location?.city}`
        : '';

    const imageAlt = localeKey === 'nl'
        ? `${storeName} - Verse ambachtelijke bakkerijproducten`
        : `${storeName} - Fresh artisanal baked goods`;

    // Create store images array for use in multiple places
    const storeImages = storeData.picture ? [
        {
            url: storeData.picture,
            width: 1200,
            height: 630,
            alt: imageAlt,
        }
    ] : localizedMetadata.openGraph?.images;

    const storeTitle = localeKey === 'nl'
        ? `${storeName} | Ambachtelijke Bakkerij op TheBakerz`
        : `${storeName} | Artisanal Bakery on TheBakerz`;

    const storeOgTitle = localeKey === 'nl'
        ? `${storeName} | Verse Bakkerijproducten Geleverd`
        : `${storeName} | Fresh Baked Goods Delivered`;

    // Generate store-specific keywords string first
    const storeKeywordsString = localeKey === 'nl'
        ? `${storeName}, ambachtelijke bakkerij, vers brood, gebak, thuisbakkerij, ${locationKeywords}, online bakkerij bestelling, ${storeData.ownerName || 'lokale bakker'}`
        : `${storeName}, artisanal bakery, fresh bread, pastries, homemade bakery, ${locationKeywords}, online bakery order, ${storeData.ownerName || 'local baker'}`;

    // Merge base keywords with store-specific keywords
    const baseKeywords = baseTranslations.keywords.split(', ');
    const storeKeywordsArray = storeKeywordsString.split(', ').map(k => k.trim()).filter(k => k !== ''); // Split, trim, and remove empty strings
    const mergedKeywords = Array.from(new Set([...baseKeywords, ...storeKeywordsArray]));

    return {
        ...localizedMetadata,
        title: storeTitle,
        description: storeDescription.substring(0, 160),
        openGraph: {
            ...localizedMetadata.openGraph,
            title: storeOgTitle,
            description: storeDescription.substring(0, 160),
            images: storeImages,
            siteName: storeName,
            locale: localeKey === 'nl' ? 'nl_NL' : 'en_US',
        },
        twitter: {
            ...localizedMetadata.twitter,
            title: storeOgTitle,
            description: storeDescription.substring(0, 160),
            images: storeData.picture ? [storeData.picture] : localizedMetadata.twitter?.images,
            card: storeData.picture ? 'summary_large_image' : 'summary',
        },
        keywords: mergedKeywords,
        alternates: {
            ...localizedMetadata.alternates,
        },
        other: {
            'og:street-address': storeData.location?.route,
            'og:locality': storeData.location?.city,
            'og:postal-code': storeData.location?.zipCode,
            'og:country-name': storeData.location?.country,
            'business:contact_data:street_address': storeData.location?.route,
            'business:contact_data:locality': storeData.location?.city,
            'business:contact_data:postal_code': storeData.location?.zipCode,
            'business:contact_data:country_name': storeData.location?.country,
            'business:contact_data:email': storeData.email || '',
            'business:contact_data:phone_number': storeData.phone || '',
            'og:email': storeData.email || '',
            'og:phone_number': storeData.phone || '',
        }
    };
}

// Helper function to set up store providers
async function setupStoreProviders({ 
    id, 
    children, 
    layoutOptions = {} 
}: { 
    id: string; 
    children: React.ReactNode; 
    layoutOptions?: Record<string, any>; 
}) {
    const storeData = await getCurrentStore(id);
    
    if (!storeData) {
        return NotFound();
    }
    
    const deliveryMode = await getDeliveryMode();
    const savedAddress = await getCurrentDeliveryAddress();
    let initialDeliveryMode = deliveryMode === 'delivery';

    if (storeData.deliveryOption !== "multi") {
        initialDeliveryMode = storeData.deliveryOption === 'delivery';
    }

    
    const cartData = await getCurrentCart(storeData.id);
    const initialStoreFavorites = await getCurrentFavorites("getStoreFavorites", storeData.id);
    const initialProductFavorites = await getCurrentFavorites("getProductFavorites", storeData.id);
    
    return (
        
        <StoreProvider
            store={storeData}
        >
            <DeliveryProvider
                initialDeliveryMode={initialDeliveryMode}
                initialAddress={savedAddress}
            >   
                <CartProvider
                    cart={cartData}
                    storeId={storeData.id}
                    initialDeliveryMode={initialDeliveryMode}
                >
                    <FavoritesProvider
                            initialStoreFavorites={initialStoreFavorites}
                            initialProductFavorites={initialProductFavorites}
                        >
                        <ProductDialogProvider>
                            <LayoutComp
                                store={storeData}
                                {...layoutOptions}
                            >
                                {children}
                            </LayoutComp>
                        </ProductDialogProvider>
                    </FavoritesProvider>
                </CartProvider>
            </DeliveryProvider>
        </StoreProvider>
    );
}

export default async function Layout({
                                         children,
                                         params,
                                     }: {
    children: React.ReactNode
    params: Params
}) {
    const { id } = await params;
    const storeData = await getCurrentStore(id);


    return (
        <div className={'min-h-svh'}>
            <GoogleMapsProvider>
                {(storeData?.storeName && id !== storeData?.storeName) && <StoreIdChecker storeId={id} storeName={storeData?.storeName}/>}
                {await setupStoreProviders({
                    id,
                    children
                })}
            </GoogleMapsProvider>
        </div>
    );
}