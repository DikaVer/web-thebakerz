import '@/styles/globals.css'
import React from "react";
import {getCurrentStore, getCurrentStoreId} from "@/lib/api/store-api";
import {getLocalizedMetadata} from "@/components/metadata";
import type {Metadata} from "next";
import {StoreIdChecker} from "@/components/store/store-id-checker";
import {StoreProvider} from "@/components/providers/store-provider";
import {ProductDialogProvider} from "@/components/providers/product-provider";
import {CartProvider} from "@/components/providers/cart-provider";
import {getCurrentCart} from "@/lib/api/cart-api";
import {getDeliveryMode, getRescueDealMode} from "@/lib/actions/cookies/delivery-cookie";
import {DeliveryProvider} from "@/components/providers/delivery-provider";
import {getCurrentDeliveryAddress} from "@/app/(store)/[id]/delivery-actions";
import LayoutComp from "@/components/layout-comp";
import NotFound from "@/app/(error_layout)/not-found";
import { GoogleMapsProvider } from '@/components/providers/google-maps-provider';
import { FavoritesProvider } from '@/components/providers/favorites-provider';
import { getCurrentFavoritesByStore } from '@/lib/api/favorites-api';
import { getRescueDeal, RescueDeal } from '@/lib/actions/rescue-deal';
import { isWithinClosingWindow } from '@/lib/utils/helper/schedule-utils';
import { getCurrentProducts } from '@/lib/api/products-api';
import { checkInventoryAvailability } from '@/lib/utils/helper/check-inventory-rescue';

type Params = Promise<{ id: string }>

export async function generateMetadata({params}: {params: Params}): Promise<Metadata> {
    const { id } = await params;
    
    const storeData = await getCurrentStore(id);
    const localeKey: 'en' = 'en';

    const baseMetadata = getLocalizedMetadata(localeKey);

    if (!storeData) {
        return {
            ...baseMetadata,
            title: "Store Not Found | TheBakerz",
            description: "The requested store could not be found. Please search again on TheBakerz.",
            robots: { index: false, follow: false }
        };
    }

    const storeName = storeData.ownerName || "TheBakerz Store";
    let title = `${storeName} | Bakery on TheBakerz`;
    if (title.length > 60) {
        title = `${(storeData.ownerName || "Bakery").substring(0, 40)}... | TheBakerz`;
        if (title.length > 60) title = title.substring(0, 57) + '...';
    }

    let description = storeData.description || `Order fresh bread, pastries & cakes from ${storeName}. Quality baked goods delivered to you. Explore now!`;
    if (description.length > 160) {
        description = description.substring(0, 157) + '...';
    } else if (description.length < 140) {
        description = `${description} Find unique items from ${storeName} on TheBakerz marketplace.`;
        if (description.length > 160) description = description.substring(0, 157) + '...';
    }
    
    const storeLocation = storeData.location ? `${storeData.location.city}, ${storeData.location.country}` : '';
    const locationKeywords = storeLocation ? `bakery in ${storeLocation}, ${storeData.location?.city} bakery, artisanal bakery ${storeData.location?.city}` : '';

    const imageAlt = `${storeName} - Fresh artisanal baked goods`;

    const storeImages = storeData.background ? [
        {
            url: storeData.background,
            width: 1200,
            height: 630,
            alt: imageAlt,
        }
    ] : baseMetadata.openGraph?.images;

    const storeKeywordsString = `${storeName}, artisanal bakery, fresh bread, pastries, homemade bakery, ${locationKeywords}, online bakery order, ${storeData.ownerName || 'local baker'}, ${storeData.location?.city || ''}`;
    
    const baseKeywords = baseMetadata.keywords || [];
    const storeKeywordsArray = storeKeywordsString.split(', ').map(k => k.trim()).filter(k => k !== '');
    const mergedKeywords = Array.from(new Set([...baseKeywords, ...storeKeywordsArray]));

    const canonicalUrl = `https://www.thebakerz.com/${storeData.storeName || id}`;

    // Initialize an empty object for 'other' metadata or use existing if compatible
    const otherMetadata: { [name: string]: string | number | (string | number)[] } = {}; 
    if (baseMetadata.other) {
        // Selectively copy known string/number properties if needed, or start fresh
        // For now, let's start fresh and add only our specific tags to avoid type issues.
    }

    otherMetadata['og:street-address'] = storeData.location?.route || '';
    otherMetadata['og:locality'] = storeData.location?.city || '';
    otherMetadata['og:postal-code'] = storeData.location?.zipCode || '';
    otherMetadata['og:country-name'] = storeData.location?.country || '';
    otherMetadata['business:contact_data:street_address'] = storeData.location?.route || '';
    otherMetadata['business:contact_data:locality'] = storeData.location?.city || '';
    otherMetadata['business:contact_data:postal_code'] = storeData.location?.zipCode || '';
    otherMetadata['business:contact_data:country_name'] = storeData.location?.country || '';
    otherMetadata['business:contact_data:email'] = storeData.email || '';
    otherMetadata['business:contact_data:phone_number'] = storeData.phone || '';
    if (storeData.location?.latitude) {
        otherMetadata['place:location:latitude'] = storeData.location.latitude.toString();
    }
    if (storeData.location?.longitude) {
        otherMetadata['place:location:longitude'] = storeData.location.longitude.toString();
    }
    otherMetadata['og:email'] = storeData.email || '';
    otherMetadata['og:phone_number'] = storeData.phone || '';

    return {
        ...baseMetadata,
        title: title,
        description: description,
        keywords: mergedKeywords,
        alternates: {
            ...baseMetadata.alternates,
            canonical: canonicalUrl,
            languages: {
                'en-US': canonicalUrl,
                'x-default': canonicalUrl,
            }
        },
        openGraph: {
            ...(baseMetadata.openGraph || {}),
            title: title,
            description: description,
            images: storeImages,
            siteName: storeName,
            url: canonicalUrl,
            locale: 'en_US',
        },
        twitter: {
            ...(baseMetadata.twitter || {}),
            title: title,
            description: description,
            images: storeData.background ? [storeData.background] : (baseMetadata.twitter?.images || []),
            card: storeData.background ? 'summary_large_image' : 'summary',
        },
        other: otherMetadata // Assign the cleaned/rebuilt otherMetadata
    };
}

// Helper function to set up store providers
async function setupStoreProviders({ 
    id, 
    children, 
}: { 
    id: string; 
    children: React.ReactNode; 
}) {
    const storeData = await getCurrentStore(id);
    
    if (!storeData) {
        return NotFound();
    }
    
    const deliveryMode = await getDeliveryMode();
    const rescueDealMode = await getRescueDealMode();   
    const savedAddress = await getCurrentDeliveryAddress();
    let initialDeliveryMode = deliveryMode === 'delivery';

    if (storeData.deliveryOption !== "multi") {
        initialDeliveryMode = storeData.deliveryOption === 'delivery';
    }

    // Check if current time is within 45 minutes of closing
    const isClosingSoon = isWithinClosingWindow(storeData.schedule);

    let rescueDeals: RescueDeal | null = null;
    if (isClosingSoon) {
        rescueDeals = await getRescueDeal(storeData.id);
        //update rescue deal with available quantity
        if(rescueDeals){
            const newQuantities = await checkInventoryAvailability(rescueDeals.products?.map(p => p.id) || [], storeData.id);    
            rescueDeals.products?.forEach(p => {
                p.quantity = newQuantities[p.id] || 0;
            });
        }
    }
    
    const cartData = await getCurrentCart(storeData.id);
    const initialStoreFavorites = await getCurrentFavoritesByStore(storeData.id);
    const productsData = await getCurrentProducts(storeData.id);

    
    return (
        
        <StoreProvider
            store={storeData}
        >
            <DeliveryProvider
                initialDeliveryMode={initialDeliveryMode}
                initialRescueDealMode={rescueDealMode}
                initialAddress={savedAddress}
            >   
                <CartProvider
                    cart={cartData}
                    storeId={storeData.id}
                    initialDeliveryMode={initialDeliveryMode}
                    rescueDeals={rescueDeals}
                >
                    <FavoritesProvider
                            initialStoreFavorites={initialStoreFavorites}
                        >
                        <ProductDialogProvider
                            productsDataServer={productsData}
                        >
                            <LayoutComp
                                store={storeData}
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
    
    const storeData = await getCurrentStoreId(id);  

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