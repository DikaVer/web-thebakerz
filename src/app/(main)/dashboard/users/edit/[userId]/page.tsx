/**
 * @fileoverview Admin page at /dashboard/users/edit/[userId] for editing a user's store.
 *
 * Server component that redirects non-admin users to /auth, loads the store,
 * business, and payment data for the given user, and renders the
 * BakerzEditTabs editor.
 */
import React from "react";

import { getStoreByUserIdAPI,  getBusinessStoreAPI, getStorePaymentAPI } from "@/lib/api/GET/store-api";

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
    const { store } = await getStoreByUserIdAPI(userId);
    
    let businessData = null;
    let paymentData = null;
    if (store) {
        businessData = await getBusinessStoreAPI(store.id);
        paymentData = await getStorePaymentAPI(store.id);
    }
    
    return <BakerzEditTabs store={store} businessData={businessData} paymentData={paymentData}/>;
}