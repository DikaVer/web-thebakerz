/**
 * @fileoverview Payment page rendered at /[id]/pay.
 *
 * Server component that loads the store and its Stripe account ID (rendering
 * NotFound when either is missing) and renders the Checkout payment
 * component, which creates a new Stripe payment session.
 */

import Checkout from "@/components/checkout/payment/checkout";
import {getStoreAPI} from "@/lib/api/GET/store-api";
import NotFound from "@/app/(error_layout)/not-found";

interface StorePageProps {
    params: Promise<{
        id: string
    }>,
    searchParams?: Promise<{
        tab?: string;
    }>;
}


export default async function Page(props: StorePageProps) {

    const params = await props.params;

    const { id } = await params


    const storeData = await getStoreAPI(id);

    if (!storeData || !storeData.stripe_id) {
        return NotFound();
    }

    return (
        <div>
            <Checkout
                id={id}
                storeId={storeData.id}
                storeStripeAccountId={storeData.stripe_id}
        />
    </div>
    );
}