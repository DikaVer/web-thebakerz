import {getCurrentStore} from "@/lib/api/store-api";
import NotFound from "@/app/(error_layout)/not-found";
import PaymentSupportButton from "@/components/support/payment-urgent";
import {getTranslations} from "next-intl/server";

interface StorePageProps {
    params: Promise<{
        id: string
    }>,
    searchParams?: Promise<{
        error?: string;
        session_id?: string;
    }>;
}

export async function generateMetadata({ params }: {
    params: Promise<{ id: string }>
}) {
    const { id } = await params;

    const storeData = await getCurrentStore(id);

    if (!storeData) {
        return {
            title: "Payment Failed",
            description: "There was an issue with your payment"
        };
    }

    return {
        title: `Payment Failed | ${storeData.ownerName}`,
        description: `Payment processing error for ${storeData.ownerName}`,
        robots: {
            index: false,
            follow: false
        }
    };
}


export default async function Page(props: StorePageProps) {

    const params = await props.params;

    const { id } = await params

    const  searchParams  = await props.searchParams;

    const storeData = await getCurrentStore(id);

    if (!storeData || !searchParams?.error || !searchParams?.session_id) {
        return NotFound();
    }
    
    const t = await getTranslations("app/(store)/id/order/failed")

    return <div>
                <div className={'flex min-h-svh w-full justify-center items-center flex-col gap-y-2 text-center'}>
                    <p>
                        {t("error")}
                    </p>
                    <PaymentSupportButton
                        error={searchParams.error}
                        description={searchParams.session_id}
                    />
                </div>
            </div>;
}