
import Checkout from "@/components/checkout/payment/checkout";
import {getCurrentStore} from "@/lib/actions/store";
import NotFound from "@/app/(error_layout)/not-found";
import LayoutComp from "@/components/layout-comp";
import {StoreProvider} from "@/components/providers/store-provider";
import {pacifico} from "@/components/fonts";
import Image from "next/image";
import {ExternalLink} from "@/components/external-link";
import React from "react";

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

    return    (
        <div className="flex flex-col mb-20 min-h-screen">
            <div className="z-10 flex flex-col justify-center items-center container mx-auto text-center ">
                <p className={`text-3xl my-10 ${pacifico.className}`}>Your Order is placed!</p>
                <div className="w-[300px] h-2/3 ml-14 mb-2">
                    <Image
                        src="/images/VerifyEmail.svg"
                        alt="Verify Email Image"
                        width={200} // Adjust based on desired size
                        height={200} // Adjust based on desired size
                        className="w-full h-full"
                        priority
                    />
                </div>
                <p>
                    Check your email for the information about your order.
                </p>
                <ExternalLink href={`/${id}`}>
                    {/*<TranslateOnServer key={'Not Found'} value={"Go back to TheBakerz"}/>*/}
                    Go back to Store
                </ExternalLink>
            </div>
        </div>
    );

}