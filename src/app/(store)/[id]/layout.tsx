import '@/styles/globals.css'
import React from "react";
import {Footer} from "@/components/footer";
import {Header} from "@/components/header";
import {extractSessionRole} from "@/lib/actions/session-actions";
import {CartProvider} from "@/components/providers/cart-provider";
import {fetchStoreId} from "@/lib/actions-server-only/store-actions";
import {ProductDialogProvider} from "@/components/providers/product-provider";
import type {Metadata} from "next";
import {metadataDefault} from "@/components/metadata";
import {HeaderAligner} from "@/components/header-aligner";
import {MenuItems} from "@/components/menu/menu-items";



export const metadata: Metadata = metadataDefault;

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

    const menuItems = await MenuItems({login, role, name});

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
                        menuItems={menuItems}
                    />
                    <HeaderAligner
                        menuItems={menuItems}
                    >
                        {children}
                        <Footer/>
                    </HeaderAligner>
                </ProductDialogProvider>
            </CartProvider>
        </>
    );
}