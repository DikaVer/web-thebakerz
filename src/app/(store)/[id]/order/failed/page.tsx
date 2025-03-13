
import Checkout from "@/components/checkout/payment/checkout";
import {getCurrentStore} from "@/lib/actions/store";
import NotFound from "@/app/(error_layout)/not-found";
import LayoutComp from "@/components/layout-comp";
import {StoreProvider} from "@/components/providers/store-provider";
import PaymentSupportButton from "@/components/support/payment-urgent";

interface StorePageProps {
    params: Promise<{
        id: string
    }>,
    searchParams?: Promise<{
        error?: string;
        session_id?: string;
    }>;
}


export default async function Page(props: StorePageProps) {

    const params = await props.params;

    const { id } = await params

    const  searchParams  = await props.searchParams;

    const storeData = await getCurrentStore(id);

    if (!storeData || !searchParams?.error || !searchParams?.session_id) {
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
                <div className={'flex min-h-svh w-full justify-center items-center flex-col gap-y-2 text-center'}
                >
                    <p>
                        Sorry, something went wrong with your order. Please send the support request and wait for the response.
                    </p>
                    <PaymentSupportButton
                        error={searchParams.error}
                        description={searchParams.session_id}
                    />
                </div>

            </LayoutComp>
        </StoreProvider>
    </div>;
}