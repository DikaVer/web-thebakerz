import {notFound} from "next/navigation";
import React from "react";
import {fetchStoreData} from "@/lib/actions-server-only/store-actions";
import {fetchUserLocation} from "@/lib/actions-server-only/user-actions";
import CheckoutView from "@/components/store/checkout/checkout-view";
import {UnderConstruction} from "@/app/(error_layout)/not-found";

interface CheckoutPageProps {
    id: string
    userId: string | undefined
    role: string | undefined
    email?: string | null
    tab?: string
}

export default async function CheckoutTransit({id, userId, role, tab, email}: CheckoutPageProps) {

    return UnderConstruction(
        "Go back to Cakes and More store",
        "/cakes_and_more"
    );

    // const [storeData, userData] = await Promise.all([
    //     fetchStoreData(id),
    //     userId ? fetchUserLocation(userId) : Promise.resolve(null)
    // ]);
    //
    //
    // if (!storeData) {
    //     return notFound();
    // }
    //
    // return (
    //     <div className="flex min-h-screen items-center justify-center">
    //         <div className="z-10 flex-grow container mx-auto pt-2">
    //             <CheckoutView
    //                 id={storeData.id}
    //                 availability={storeData.availability}
    //                 email={email}
    //                 userLocation={userData}
    //             />
    //         </div>
    //     </div>
    // );
}