import React from "react";

import { getCurrentStoreByUserId,  getCurrentBusinessStore, getCurrentStorePayment } from "@/lib/api/store-api";

import {getCurrentSession} from "@/lib/actions/session";
import {redirect} from "next/navigation";
import { BakerzEditTabs } from "@/components/dashboard/onboard/edit/tabs-bakerz-edit";

interface UserEditProps {
    params: Promise<{
        userId: string
    }>
}

export default async function Page({ params }: UserEditProps) {
    const { userId } = await params;
    
    // Check admin permissions
    const session = await getCurrentSession();
    if (!session || session.user?.role !== "admin") {
        redirect('/auth');
    }

    
    // Fetch store data and business data
    const { store } = await getCurrentStoreByUserId(userId);
    
    let businessData = null;
    let paymentData = null;
    if (store) {
        businessData = await getCurrentBusinessStore(store.id);
        paymentData = await getCurrentStorePayment(store.id);   
    }
    
    return <BakerzEditTabs store={store} businessData={businessData} paymentData={paymentData}/>;
}