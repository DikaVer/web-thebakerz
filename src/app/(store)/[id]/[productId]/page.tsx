import React, {Suspense} from "react";
import {getOrderTime} from "@/app/(store)/[id]/actions";
import StoreSkeleton from "@/components/skeletons";
import {ProductComponentBase} from "@/components/store/product/product-comp";
import {Spacer} from "@heroui/react";
import {getCurrentStore} from "@/lib/actions/store";
import NotFound from "@/app/(error_layout)/not-found";
import {getCurrentCart} from "@/lib/actions/cart";
import {StoreProvider} from "@/components/providers/store-provider";
import LayoutComp from "@/components/layout-comp";
import {ProductDialogProvider} from "@/components/providers/product-provider";
import {StoreTop} from "@/components/store/store-header/store-top";
import { FooterStore } from "@/components/footer-store";
import {CartProvider} from "@/components/providers/cart-provider";
import {ProductListSkeleton} from "@/components/skeleton/product-list-skeleton";
import {getCurrentProduct, getProductByStoreIdAndProductId} from "@/lib/actions/product";
import {ProductPage} from "@/components/store/product-page/product-page";
import {getDeliveryMode} from "@/lib/delivery-cookie";
import {DeliveryProvider} from "@/components/providers/delivery-provider";
import { getCurrentDeliveryAddress } from "../delivery-actions";

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
        const storeData = await getCurrentStore(id);
        if (!storeData) {
            return {
                title: 'Product Not Found',
                description: 'The requested product could not be found'
            };
        }

        const product = await getCurrentProduct(storeData.id, productId);

        if (!product) {
            return {
                title: `${storeData.ownerName} | Product Not Found`,
                description: 'The requested product could not be found'
            };
        }

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

    const { id, productId } = await params

    const storeData = await getCurrentStore(id);

    if (!storeData) {
        return NotFound();
    }

    const cartData = await getCurrentCart(storeData.id);
    const deliveryMode = await getDeliveryMode();
    const savedAddress = await getCurrentDeliveryAddress(storeData.id);

    return (
        <CartProvider
            cart={cartData}
            storeId={storeData.id}
        >
            <ProductDialogProvider
                storeId={storeData.id}
            >
                <StoreProvider
                    store={storeData}
                >
                    <DeliveryProvider 
                    initialDeliveryMode={deliveryMode === 'delivery'}
                    initialAddress={savedAddress}
                    >
                        <LayoutComp
                            isVisibleCart={true}
                            hideSideBar={true}
                            store={storeData}
                        >
                            <div className="flex flex-col min-h-screen relative z-10 items-center">
                                <div className="flex flex-col container mx-auto items-center justify-center">
                                    <ProductPage
                                        storeId={storeData.id}
                                        productId={productId}
                                    />
                                </div>
                                <Spacer y={16}/>
                            </div>
                            <FooterStore/>
                        </LayoutComp>
                    </DeliveryProvider>
                </StoreProvider>
            </ProductDialogProvider>
        </CartProvider>
    );
}