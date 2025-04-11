import React, {Suspense} from "react";
import {Spacer} from "@heroui/react";
import NotFound from "@/app/(error_layout)/not-found";
import { FooterStore } from "@/components/footer-store";
import {getCurrentProduct} from "@/lib/actions/product";
import {ProductPage} from "@/components/store/product-page/product-page";
import {generateStorePageMetadata, verifyStoreExists} from "../store-utils";
import {getCurrentStore} from "@/lib/actions/store";

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
}) {
    try {
        const { id, productId } = await params;
        
        // Leverage our utility for base metadata
        const storeData = await verifyStoreExists(id);
        if (!storeData) {
            return generateStorePageMetadata(id, 'Product Not Found', 'The requested product could not be found');
        }

        const product = await getCurrentProduct(storeData.id, productId);

        if (!product) {
            return generateStorePageMetadata(id, 'Product Not Found', 'The requested product could not be found');
        }

        // Add product-specific metadata
        return {
            title: `${product.name} | ${storeData.ownerName}`,
            description: product.description || `${product.name} - Available at ${storeData.ownerName}`,
            openGraph: {
                title: `${product.name} | ${storeData.ownerName}`,
                description: product.description || `${product.name} - Available at ${storeData.ownerName}`,
                images: [
                    {
                        url: product.picture,
                        width: 1200,
                        height: 630,
                        alt: product.name
                    }
                ]
            },
            twitter: {
                card: 'summary_large_image',
                title: `${product.name} | ${storeData.ownerName}`,
                description: product.description || `${product.name} - Available at ${storeData.ownerName}`,
                images: [product.picture]
            }
        };
    } catch (error) {
        console.error('Error generating metadata:', error);
        return {
            title: 'Product',
            description: 'View product details'
        };
    }
}


export default async function Page(props: StorePageProps) {
    const params = await props.params;
    const { id, productId } = await params;

    const storeData = await getCurrentStore(id);

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