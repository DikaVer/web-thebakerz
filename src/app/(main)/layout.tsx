import '@/styles/globals.css'
import React from "react";
import {Footer} from "@/components/footer";
import LayoutComp from "@/components/layout-comp";
import { DeliveryProvider } from '@/components/providers/delivery-provider';
import { getCurrentDeliveryAddress } from '../(store)/[id]/delivery-actions';
import { getDeliveryMode } from '@/lib/actions/cookies/delivery-cookie';
import { GoogleMapsProvider } from '@/components/providers/google-maps-provider';
import { FavoritesProvider } from '@/components/providers/favorites-provider';
import { ProductDialogProvider } from '@/components/providers/product-provider';
import { getCurrentStoreFavorites } from '@/lib/api/favorites-api';


export default async function Layout(
    {
                                         children,
                                  } : {
    children: React.ReactNode
}) {

    // const cartData = await getCurrentCart("11");
    const deliveryMode = await getDeliveryMode();
    const savedAddress = await getCurrentDeliveryAddress();
    
    let initialDeliveryMode = deliveryMode === 'delivery';

    const initialStoreFavorites = await getCurrentStoreFavorites();

    return (
            <>
                <DeliveryProvider
                    initialDeliveryMode={initialDeliveryMode}
                    initialAddress={savedAddress}
                >   
                    <ProductDialogProvider>
                        <FavoritesProvider
                            initialStoreFavorites={initialStoreFavorites}
                        >
                            <GoogleMapsProvider>
                                <LayoutComp>
                                    {children}
                                    <Footer/>
                                </LayoutComp>
                            </GoogleMapsProvider>
                        </FavoritesProvider>
                    </ProductDialogProvider>
                </DeliveryProvider>
            </>
    );
}