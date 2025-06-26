
import Checkout from "@/components/checkout/payment/checkout";
import {getStoreAPI} from "@/lib/api/GET/store-api";
import NotFound from "@/app/(error_layout)/not-found";


interface StorePageProps {
    params: Promise<{
        id: string
        session: string
    }>
}


export default async function Page(props: StorePageProps) {

    const params = await props.params;

    const { id, session } = params

    const storeData = await getStoreAPI(id);

    if (!storeData || !session || !storeData.stripe_id) {
        return NotFound();
    }

    return (
        <div>
            <Checkout
                id={id}
                storeId={storeData.id}
                storeStripeAccountId={storeData.stripe_id}
                clientSecretParam={session}
            />
        </div>
    );
}