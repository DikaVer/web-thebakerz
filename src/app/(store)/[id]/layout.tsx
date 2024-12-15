import '@/styles/globals.css'
import React from "react";
import {Footer} from "@/components/footer";
import {Header} from "@/components/header";
import {extractSession} from "@/lib/actions/session-actions";
import {CartProvider} from "@/components/providers/cart-provider";
import {fetchStoreId} from "@/lib/actions-server-only/store-actions";
import {ProductDialogProvider} from "@/components/providers/product-provider";
import {HeaderAligner} from "@/components/header-aligner";


type Params = Promise<{ id: string  }>

export async function generateMetadata({ params }: { // @ts-ignore
    params: Params }) {
    const { id } = await params
}

export default async function Layout({
                                         children,
                                         params,
                                     }: {
    children: React.ReactNode
    params: Params
}) {

    const { id } = await params


    const [sessionRole, storeData] = await Promise.all([
        extractSession(),
        fetchStoreId(id)
    ]);

    const session = sessionRole;


    return (
        <>
            <CartProvider
                storeData={storeData}
            >
                <ProductDialogProvider>
                    <Header
                        storeId={storeData?.storeId}
                        main={false}
                        session={session}

                    />
                    <HeaderAligner
                        session={session}
                    >
                        {children}
                        <Footer/>
                    </HeaderAligner>
                </ProductDialogProvider>
            </CartProvider>
        </>
    );
}