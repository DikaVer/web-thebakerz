import React from "react";
import {Spacer} from "@heroui/react";
import NotFound from "@/app/(error_layout)/not-found";
import { FooterStore } from "@/components/footer-store";
import {getCurrentProduct} from "@/lib/actions/product";
import {ProductPage} from "@/components/store/product-page/product-page";
import {getCurrentStore} from "@/lib/actions/store";
import { getLocale } from 'next-intl/server';
import { getLocalizedMetadata } from '@/components/metadata';
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

export async function generateMetadata({params}: {params: Params}): Promise<Metadata> {
    try {
        const { id, productId } = await params;
        const localeKey: 'en' = 'en';
        const baseMetadata = getLocalizedMetadata(localeKey);

        const storeData = await getCurrentStore(id);
        if (!storeData) {
            return {
                title: "Store Not Found | TheBakerz",
                description: "Sorry, this store could not be found. Please check the URL or search for another store."
            };
        }

        const product = await getCurrentProduct(storeData.id, productId);
        if (!product) {
            return {
                title: "Product Not Found | TheBakerz",
                description: "Sorry, this product could not be found in the store. Please try another item."
            };
        }

        const storeName = storeData.ownerName || "TheBakerz Store";
        let productTitle = `${product.name} | ${storeName} | TheBakerz`; 
        if (productTitle.length > 60) {
             productTitle = `${product.name.substring(0, Math.max(0, 40 - storeName.length - 12))}... | ${storeName} | TheBakerz`;
             if (productTitle.length > 60) productTitle = productTitle.substring(0, 57) + '...';
        }
        
        let productDescription = (product.description || `${product.name} available at ${storeName}. Order now for fresh delivery or pickup!`);
        if (productDescription.length > 160) {
            productDescription = productDescription.substring(0, 157) + '...';
        } else if (productDescription.length < 140) {
            productDescription = `${productDescription} Discover more from ${storeName} on TheBakerz.`;
            if (productDescription.length > 160) productDescription = productDescription.substring(0, 157) + '...';
        }

        const productImageAlt = `${product.name} - ${storeName}`;

        const productImages = product.picture ? [
            {
                url: product.picture,
                width: 1200, 
                height: 630,
                alt: productImageAlt
            }
        ] : baseMetadata.openGraph?.images;

        const productKeywordsString = `${product.name}, ${product.category || 'baked goods'}, order ${product.name}, ${storeName} ${product.name}, buy ${product.name}`;
        const productKeywords = productKeywordsString.split(', ').map(k => k.trim());

        const baseKeywords = baseMetadata.keywords || [];
        const mergedKeywords = Array.from(new Set([...baseKeywords, ...productKeywords]));
        
        const canonicalUrl = `https://www.thebakerz.com/${storeData.storeName || id}/item/${productId}`;

        return {
            ...baseMetadata,
            title: productTitle,
            description: productDescription,
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
                title: productTitle, 
                description: productDescription, 
                images: productImages,
                type: 'article', 
                url: canonicalUrl, 
                siteName: storeName, 
            },
            twitter: {
                ...(baseMetadata.twitter || {}),
                card: product.picture ? 'summary_large_image' : 'summary',
                title: productTitle, 
                description: productDescription, 
                images: product.picture ? [product.picture] : (baseMetadata.twitter?.images || []) 
            },
        };
    } catch (error) {
        console.error('Error generating metadata for product:', error);
        return {
            title: 'Error | TheBakerz',
            description: 'Could not load product details. Please try again later.'
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

    const productData = await getCurrentProduct(storeData.id, productId);
    const productStructuredData = {
        "@context": "https://schema.org",
        "@type": "Product",
        "name": productData?.name || "",
        "image": productData?.picture ? [productData.picture] : [],
        "description": productData?.description || "",
        "brand": { "@type": "Organization", "name": storeData.ownerName || storeData.id || "TheBakerz" },
        "offers": {
            "@type": "Offer",
            "price": productData?.price || 0,
            "priceCurrency": "EUR",
            "availability": "http://schema.org/InStock",
            "seller": { "@type": "Organization", "name": storeData.ownerName || storeData.id }
        }
    };

    // Store data and providers are handled in the layout
    return (
        <>
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
            <script 
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(productStructuredData) }} />
        </>
    );
}