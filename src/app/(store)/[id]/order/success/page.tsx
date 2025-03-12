
import Checkout from "@/components/checkout/payment/checkout";
import {getCurrentStore} from "@/lib/actions/store";
import NotFound from "@/app/(error_layout)/not-found";
import LayoutComp from "@/components/layout-comp";
import {StoreProvider} from "@/components/providers/store-provider";

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


    const storeData = await getCurrentStore(id);

    if (!storeData) {
        return NotFound();
    }

    return <div>
        <StoreProvider
            store={storeData}
        >
            <LayoutComp
                pay={true}
                hideSideBar={true}
                store={storeData}
            >
                <div className={'flex min-h-svh w-full justify-center items-center flex-col gap-y-2'}>
                    <h1>Order Confirmation</h1>
                    <p>We received your order. Thank you for shopping with us.</p>
                    <p>Please check your email for further details regarding your order.</p>
                </div>
            </LayoutComp>
        </StoreProvider>
    </div>;
}