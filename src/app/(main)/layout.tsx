import '@/styles/globals.css'
import React from "react";
import {Footer} from "@/components/footer";
import type {Metadata} from "next";
import {metadataDefault} from "@/components/metadata";
import LayoutComp from "@/components/layout-comp";
import { CartProvider } from '@/components/providers/cart-provider';
import { DeliveryProvider } from '@/components/providers/delivery-provider';
import { getCurrentDeliveryAddress } from '../(store)/[id]/delivery-actions';
import { getDeliveryMode } from '@/lib/delivery-cookie';
import { getCurrentCart } from '@/lib/actions/cart';
import { GoogleMapsProvider } from '@/components/providers/google-maps-provider';


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


    return (
            <>
                <DeliveryProvider
                    initialDeliveryMode={initialDeliveryMode}
                    initialAddress={savedAddress}
                >   
                    <GoogleMapsProvider>
                        <LayoutComp>
                            {children}
                            <Footer/>
                        </LayoutComp>
                    </GoogleMapsProvider>
                </DeliveryProvider>
            </>
    );
}