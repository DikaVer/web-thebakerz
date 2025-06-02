import { lexendDeca } from "@/components/fonts";
import '@/styles/globals.css'
import React from "react";
import {getLocalizedMetadata} from "@/components/metadata";
import {Providers} from "@/app/providers";
import CookieConsentComponent from "@/components/ui/cookie-consent";
import type { Viewport } from 'next'
import {getCurrentSession} from "@/lib/actions/session";
import {NextIntlClientProvider} from 'next-intl';
import {getLocale, getMessages} from 'next-intl/server';
import LanguageModal from "@/components/language-modal";
import {getCookiePreferences, isCookieConsentFromServer} from "@/lib/actions/cookies/cookie";
import ClarityScript from "@/components/clarity-script";
import GoogleAnalytics from "@/components/google-analytics";
import { getLanguageCookie } from "@/lib/actions/language";


export const viewport: Viewport = {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 5,
    userScalable: true,
    viewportFit: 'cover'
}

// Enhanced metadata generation that covers all filter options and search capabilities
export async function generateMetadata() {
    const baseMetadata = getLocalizedMetadata('en');
    
    const comprehensiveKeywords = [
        // Base keywords
        ...baseMetadata.keywords || [],
        
        // Delivery modes
        "bakery delivery", "bakery pickup", "bread delivery near me", "pastry pickup",
        "cake delivery service", "local bakery delivery", "artisanal bread pickup",
        
        // Product categories from local-variables.ts
        "Cakes bakery", "Cheesecake shop", "Chocolate treats", "Bonbon shop", "Chocolate Bar bakery",
        "Marshmallow confections", "Cookies and Biscuits online", "Cupcakes order", "Donuts delivery",
        "Eclairs pastry", "Macarons shop", "Pastries near me", "Pies bakery", 
        "Birthday Cakes order", "Wedding Cakes custom",
        
        // Dietary filters from super-icons.tsx
        "sugar-free bakery", "lactose-free cakes", "gluten-free pastries", "halal bakery", "vegan bread",
        "vegan desserts", "gluten-free cookies", "sugar-free chocolate",
        
        // Key Allergies from ProductFilter.tsx (for exclusion, so phrasing is for finding options *without* these)
        "bakery without nuts", "gluten-free products", "dairy-free bakery", "egg-free cakes",
        "soy-free bread", "wheat-free pastries", "milk-free desserts", "sesame-free bakery",
        
        // Price-related
        "affordable bakery", "budget friendly pastries", "premium bakery", "cheap bread",
        "luxury cakes", "value bakery deals", "discount pastries online",
        
        // Search and filtering
        "search bakery by category", "find bakery by dietary needs", "filter bakery by allergens", "browse pastries by price",
        "compare bakery prices and options", "local bakery finder with filters"
    ];
    
    // Create a unique set of keywords
    const uniqueKeywords = Array.from(new Set(comprehensiveKeywords));

    return {
        ...baseMetadata,
        keywords: uniqueKeywords,
        other: {
            ...baseMetadata.other,
            'search-capabilities': 'delivery,pickup,categories,allergies,dietary,price-range', // Remains general
            // Updated filter-options to be more specific based on actual values
            'filter-options': 'Cakes,Cheesecake,Chocolate,Bonbon,Cookies,Cupcakes,Donuts,Eclairs,Macarons,Pastries,Pies,Birthday Cakes,Wedding Cakes,sugar-free,lactose-free,gluten-free,halal,vegan,exclude-nuts,exclude-gluten,exclude-dairy,exclude-egg,exclude-soy,exclude-wheat,exclude-milk',
            'service-types': 'delivery,pickup,local-bakery,artisanal-bread,custom-cakes,online-ordering' // Added online-ordering
        }
    };
}


export default async function RootLayout({
                                       children,
                                   }: Readonly<{
    children: React.ReactNode;
}>) {

    const session = await getCurrentSession();

    const lang = await getLanguageCookie();
    const locale = await getLocale();
    const currentLocale = 'en';

    const messages = await getMessages({locale: currentLocale});

    const cookieConsent = await isCookieConsentFromServer();
    const preferences = await getCookiePreferences();

    // Enhanced WebSite structured data with comprehensive search and filter capabilities
    const webSiteStructuredData = {
        "@context": "https://schema.org",
        "@type": "WebSite",
        "url": "https://www.thebakerz.com/",
        "name": "TheBakerz",
        "alternateName": "The Bakerz Platform",
        "description": "Comprehensive bakery and pastry shop platform with delivery and pickup options, filtering by categories, dietary preferences, and allergies.",
        "potentialAction": [
            {
                "@type": "SearchAction",
                "target": "https://www.thebakerz.com/search?mode={delivery_mode}&categories={categories}&dietary={dietary}&allergies={allergies}&minPrice={min_price}&maxPrice={max_price}",
                "query-input": [
                    "required name=delivery_mode",
                    "optional name=categories",
                    "optional name=dietary", 
                    "optional name=allergies",
                    "optional name=min_price",
                    "optional name=max_price"
                ]
            }
        ],
        "publisher": {
            "@type": "Organization",
            "name": "TheBakerz",
            "logo": {
                "@type": "ImageObject",
                "url": "https://storage4thebakerz.blob.core.windows.net/email-messages/TheBakerzLogo.svg"
            }
        },
        "hasOfferCatalog": {
            "@type": "OfferCatalog",
            "name": "Bakery Products Catalog",
            "itemListElement": [
                {
                    "@type": "OfferCatalog",
                    "name": "Bread & Artisanal Products",
                    "category": "Food & Beverage"
                },
                {
                    "@type": "OfferCatalog", 
                    "name": "Cakes & Custom Orders",
                    "category": "Food & Beverage"
                },
                {
                    "@type": "OfferCatalog",
                    "name": "Pastries & Desserts", 
                    "category": "Food & Beverage"
                },
                {
                    "@type": "OfferCatalog",
                    "name": "Specialty & Dietary Options",
                    "category": "Food & Beverage"
                }
            ]
        }
    };

    // Additional structured data for filtering capabilities
    const filterCapabilitiesStructuredData = {
        "@context": "https://schema.org",
        "@type": "WebApplication",
        "name": "TheBakerz Search & Filter",
        "url": "https://www.thebakerz.com/search",
        "applicationCategory": "Food & Beverage",
        "operatingSystem": "Web Browser",
        "offers": {
            "@type": "Offer",
            "price": "0",
            "priceCurrency": "EUR"
        },
        "featureList": [
            "Delivery and Pickup Options",
            "Category Filtering (Bread, Cakes, Pastries, Cookies)",
            "Dietary Preference Filtering (Vegan, Organic, Gluten-Free)",
            "Allergy Filtering (Nut-Free, Dairy-Free, Gluten-Free)",
            "Price Range Filtering",
            "Location-Based Search",
            "Real-Time Availability"
        ]
    };

    return (
        <html lang={lang || locale}>
            <head>
                <script 
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{ __html: JSON.stringify(webSiteStructuredData) }} 
                />
                <script 
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{ __html: JSON.stringify(filterCapabilitiesStructuredData) }} 
                />
            </head>
            <body className={`${lexendDeca.className} max-w-full `}>
                <NextIntlClientProvider messages={messages} locale={lang || locale}>
                    <Providers
                        locale={lang || locale}
                        session={session}
                    >
                        <>
                            <ClarityScript />
                            <GoogleAnalytics/>
                        </>
                        {children}
                        {<CookieConsentComponent id={session?.user?.id} isConsent={cookieConsent} preferences={preferences} role={session?.user?.role}/>}
                    </Providers>
                </NextIntlClientProvider>
            </body>
        </html>
    );
}