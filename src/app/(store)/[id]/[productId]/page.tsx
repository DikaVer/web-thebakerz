import React from "react";
import {Spacer} from "@heroui/react";
import NotFound from "@/app/(error_layout)/not-found";
import { FooterStore } from "@/components/footer-store";
import {getCurrentProduct} from "@/lib/actions/product";
import {ProductPage} from "@/components/store/product-page/product-page";
import {getCurrentStore} from "@/lib/actions/store";
import { getLocale } from 'next-intl/server';
import { getLocalizedMetadata, metadataTranslations } from '@/components/metadata';
import type { Metadata } from 'next';

interface StorePageProps {
    params: Promise<{
        id: string,
        productId: string
    }>,
    searchParams?: Promise<{
        tab?: string;
    }>;
}

type Params = Promise<{ id: string, productId: string }>

export async function generateMetadata({
                                           params
                                       }: {
    params: Params
}): Promise<Metadata> {
    try {
        const { id, productId } = await params;
        const locale = await getLocale();

        // Get base metadata first
        const baseMetadata = getLocalizedMetadata(locale);
        let localeKey: 'en' | 'nl' = 'en';
        if (locale === 'nl-NL' || locale === 'nl') {
            localeKey = 'nl';
        }

        // Fetch store and product data
        const storeData = await getCurrentStore(id);
        if (!storeData) {
            // Return simple not found metadata
            return {
                title: "Store Not Found",
                description: "This store could not be found."
            };
        }

        const product = await getCurrentProduct(storeData.id, productId);

        if (!product) {
            // Return simple not found metadata
            return {
                title: "Product Not Found",
                description: "This product could not be found in the store."
            };
        }

        const storeName = storeData.ownerName || "TheBakerz Store";
        const productTitle = `${product.name} | ${storeName}`;
        const productDescription = (product.description || `${product.name} - Available at ${storeName}`).substring(0, 160);

        const productUrl = storeData.storeName
            ? `https://www.thebakerz.com/${storeData.storeName}/${productId}`
            : `https://www.thebakerz.com/${id}/${productId}`;

        const productImageAlt = `${product.name} - ${storeName}`;

        // Define product images array
        const productImages = product.picture ? [
            {
                url: product.picture,
                width: 1200, // Standard OG size
                height: 630,
                alt: productImageAlt
            }
        ] : baseMetadata.openGraph?.images; // Fallback to base images

        // Define product-specific keywords
        const productKeywordsString = `${product.name}, ${product.category || 'baked goods'}, order ${product.name}, ${storeName} ${product.name}`;
        const productKeywords = productKeywordsString.split(', ').map(k => k.trim());

        // Merge keywords (base + product-specific)
        const baseKeywords = metadataTranslations[localeKey].keywords.split(', ');
        const mergedKeywords = Array.from(new Set([...baseKeywords, ...productKeywords]));

        // Merge base metadata with product-specific overrides
        return {
            ...baseMetadata,
            title: productTitle,
            description: productDescription,
            keywords: mergedKeywords,
            alternates: {
                ...baseMetadata.alternates,
                canonical: productUrl,
                languages: {
                    // Update language keys for the product page
                    'en-US': storeData.storeName ? `https://www.thebakerz.com/${storeData.storeName}/${productId}` : `https://www.thebakerz.com/${id}/${productId}`,
                    'nl-NL': storeData.storeName ? `https://www.thebakerz.com/nl/${storeData.storeName}/${productId}` : `https://www.thebakerz.com/${id}/${productId}`,
                    'x-default': storeData.storeName ? `https://www.thebakerz.com/${storeData.storeName}/${productId}` : `https://www.thebakerz.com/${id}/${productId}`,
                }
            },
            openGraph: {
                ...baseMetadata.openGraph,
                title: productTitle,
                description: productDescription,
                url: productUrl,
                images: productImages,
                type: 'article', // Changed from 'product' to 'article' which is valid in Next.js
                siteName: storeName, // Use store name as site name here
            },
            twitter: {
                ...baseMetadata.twitter,
                card: product.picture ? 'summary_large_image' : 'summary',
                title: productTitle,
                description: productDescription,
                images: product.picture ? [product.picture] : baseMetadata.twitter?.images // Fallback image
            },
        };
    } catch (error) {
        console.error('Error generating metadata:', error);
        return {
            title: 'Error',
            description: 'Could not load product details'
        };
    }
}

export default async function Page(props: StorePageProps) {
    const params = await props.params;
    const { id, productId } = await params;

    const storeData = await getCurrentStore(id);
    if (!storeData) {
        return <NotFound />;
    }

    // Store data and providers are handled in the layout
    return (
        <div className="flex flex-col min-h-screen relative z-10 items-center">
            <div className="flex flex-col container mx-auto items-center justify-center">
                <ProductPage
                    storeId={storeData.id}
                    productId={productId}
                />
            </div>
            <Spacer y={16}/>
            <FooterStore/>
        </div>
    );
}