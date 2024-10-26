import '@/styles/globals.css'
import React from "react";
import type {Metadata} from "next";
import {Footer} from "@/components/footer";
import {Header} from "@/components/header";
import {extractSessionRole} from "@/lib/actions/session-actions";
import {CartProvider} from "@/components/providers/cart-provider";
import {fetchStoreId} from "@/lib/actions-server-only/store-actions";
import {notFound} from "next/navigation";
import {ProductDialogProvider} from "@/components/providers/product-provider";

export const metadata: Metadata = {
    metadataBase: new URL(`https://www.TheBakerz.com/`),
    title: {
        default: 'TheBakerz',
        template: `%s - TheBakerz`
    },
    description: '',

}

export default async function RootLayout({
                                             children,
                                             params
                                         }: Readonly<{
    children: React.ReactNode;
    params: { id: string };
}>) {

    const [sessionRole, storeData] = await Promise.all([
        extractSessionRole(),
        fetchStoreId(params.id)
    ]);
    const { login, role, name } = sessionRole;


    return (
        <>
            <CartProvider
                storeData={storeData}
            >
                <ProductDialogProvider>
                    <Header
                        storeId={storeData?.storeId}
                        main={false}
                        login={login}
                        role={role}
                        name={name}
                    />
                    {children}
                </ProductDialogProvider>
            </CartProvider>
            <Footer />
        </>
    );
}