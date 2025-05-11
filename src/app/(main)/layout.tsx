import '@/styles/globals.css'
import React from "react";
import {Footer} from "@/components/footer";
import LayoutComp from "@/components/layout-comp";
import { DeliveryProvider } from '@/components/providers/delivery-provider';
import { getCurrentDeliveryAddress } from '../(store)/[id]/delivery-actions';
import { getDeliveryMode } from '@/lib/delivery-cookie';
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