import '@/styles/globals.css'
import React from "react";
import {getCurrentStore, getStoreDataByStoreNameOrId} from "@/lib/actions/store";
import {getLocalizedMetadata, metadataDefault} from "@/components/metadata";
import type {Metadata} from "next";
import {getLocale} from "next-intl/server";
import {StoreIdChecker} from "@/components/store/store-id-checker";

type Params = Promise<{ id: string }>

export async function generateMetadata({
                                           params,
                                       }: {
    params: Params,
}): Promise<Metadata> {
    const { id } = await params;
    const storeData = await getStoreDataByStoreNameOrId(id);
    const locale = await getLocale();

    // Get base localized metadata
    const localizedMetadata = getLocalizedMetadata(locale);

    if (!storeData) {
        return {
            title: "Store Not Found | TheBakerz",
            description: "The requested store could not be found."
        };
    }

    const storeName = storeData.ownerName || "TheBakerz Store";
    const storeDescription = storeData.description ||
    locale === 'nl'
        ? `Bestel verse, ambachtelijke bakkerijproducten van ${storeName}. Handgemaakt met zorg en aan uw deur geleverd.`
        : `Order fresh, artisanal baked goods from ${storeName}. Handcrafted with care and delivered to your door.`;

    const storeLocation = storeData.location ?
        `${storeData.location.city}, ${storeData.location.country}` : '';
    const storeUrl = storeData.storeName
        ? `https://www.thebakerz.com/${storeData.storeName}/orders/`
        : `https://www.thebakerz.com/${id}/orders/`;

    // Create location-based keywords if available
    const locationKeywords = storeLocation
        ? locale === 'nl'
            ? `bakkerij in ${storeLocation}, ${storeData.location?.city} bakkerij, ambachtelijke bakkerij ${storeData.location?.city}`
            : `bakery in ${storeLocation}, ${storeData.location?.city} bakery, artisanal bakery ${storeData.location?.city}`
        : '';

    // Create store images array for use in multiple places
    const storeImages = storeData.picture ? [
        {
            url: storeData.picture,
            width: 1200,
            height: 630,
            alt: locale === 'nl'
                ? `${storeName} - Ambachtelijke Bakkerij`
                : `${storeName} - Artisanal Bakery`,
        }
    ] : localizedMetadata.openGraph?.images;

    const storeTitle = locale === 'nl'
        ? `${storeName} | Ambachtelijke Bakkerij op TheBakerz`
        : `${storeName} | Artisanal Bakery on TheBakerz`;

    const storeOgTitle = locale === 'nl'
        ? `${storeName} | Verse Bakkerijproducten Geleverd`
        : `${storeName} | Fresh Baked Goods Delivered`;

    const keywords = locale === 'nl'
        ? `${storeName}, ambachtelijke bakkerij, vers brood, gebak, thuisbakkerij, ${locationKeywords}, online bakkerij bestelling, ${storeData.ownerName || 'lokale bakker'}`
        : `${storeName}, artisanal bakery, fresh bread, pastries, homemade bakery, ${locationKeywords}, online bakery order, ${storeData.ownerName || 'local baker'}`;

    const imageAlt = locale === 'nl'
        ? `${storeName} - Verse ambachtelijke bakkerijproducten`
        : `${storeName} - Fresh artisanal baked goods`;

    return {
        ...localizedMetadata,
        title: storeTitle,
        description: storeDescription.substring(0, 160),
        openGraph: {
            ...localizedMetadata.openGraph,
            title: storeOgTitle,
            description: storeDescription.substring(0, 160),
            url: storeUrl,
            images: storeImages,
            siteName: storeName,
            locale: locale === 'nl' ? 'nl' : 'en_NL',
        },
        twitter: {
            ...localizedMetadata.twitter,
            title: storeOgTitle,
            description: storeDescription.substring(0, 160),
            images: storeData.picture ? [storeData.picture] : localizedMetadata.twitter?.images,
            card: 'summary_large_image',
        },
        appLinks: storeData.picture ? {
            web: {
                url: storeUrl,
                should_fallback: true,
            },
        } : undefined,
        keywords: keywords,
        alternates: {
            ...localizedMetadata.alternates,
            canonical: storeUrl,
            languages: {
                'nl': storeUrl,
                'en-NL': storeUrl,
            }
        },
        other: {
            'og:image:alt': imageAlt,
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

export default async function Layout({
                                         children,
                                         params,
                                     }: {
    children: React.ReactNode
    params: Params
}) {
    const { id } = await params;

    const storeData = await getCurrentStore(id);

    // console.log(storeData);

    return (
        <div className={'min-h-svh'}>
            <StoreIdChecker storeId={id} storeName={storeData?.storeName}/>
            {children}
        </div>
    );
}